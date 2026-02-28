import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "./error";

/**
 * Options for creating a reusable rate-limit guard.
 *
 * @typeParam T - Input payload type evaluated by the guard.
 *
 * @public
 */
export type CreateRateLimitGuardOptions<T> = {
  /** Factory for customizing the error returned when a rule is exceeded. */
  buildRateLimitedError?:
    | ((ctx: RateLimitExceededContext<T>) => RichError)
    | undefined;
  /** Store-failure handling strategy. Defaults to `"fail-closed"`. */
  failureMode?: RateLimitFailureMode | undefined;
  /** Callback invoked when a store failure is bypassed in `"fail-open"` mode. */
  onBypass?: ((ctx: RateLimitBypassContext<T>) => void) | undefined;
  /** Ordered list of rules to evaluate for each input. */
  rules: RateLimitRule<T>[];
  /** Backend store used to consume rule counters. */
  store: RateLimitStore;
};

/**
 * Context passed to `onBypass` when a store failure is bypassed in fail-open mode.
 *
 * @typeParam T - Input payload type evaluated by the guard.
 *
 * @public
 */
export type RateLimitBypassContext<T> = {
  /** Original store failure that triggered bypass handling. */
  error: RichError;
  /** Guard input associated with the failed store call. */
  input: T;
  /** Rule being evaluated when the store failure occurred. */
  rule: RateLimitRule<T>;
};

/**
 * Input payload consumed by a rate-limit store implementation.
 *
 * @public
 */
export type RateLimitConsumeInput = {
  /** Stable bucket key, usually mapped from rule id. */
  bucket: string;
  /** Identifier to rate-limit within the bucket (for example user id). */
  identifier: string;
  /** Maximum number of allowed requests in the rule window. */
  limit: number;
  /** Sliding/fixed window size in seconds, depending on store implementation. */
  windowSeconds: number;
};

/**
 * Normalized decision returned by a rate-limit store.
 *
 * @public
 */
export type RateLimitDecision = {
  /** Whether this request is allowed to proceed. */
  allowed: boolean;
  /** Rule limit used for evaluation. */
  limit: number;
  /** Remaining allowance after this request. */
  remaining: number;
  /** UNIX epoch seconds when the current window resets. */
  resetEpochSeconds: number;
};

/**
 * Context used to build a custom rate-limited error.
 *
 * @typeParam T - Input payload type evaluated by the guard.
 *
 * @public
 */
export type RateLimitExceededContext<T> = {
  /** Decision returned by the store when the rule was evaluated. */
  decision: RateLimitDecision;
  /** Guard input that triggered the exceeded decision. */
  input: T;
  /** Rule that produced the exceeded decision. */
  rule: RateLimitRule<T>;
};

/**
 * Failure handling mode used by `createRateLimitGuard`.
 *
 * @public
 */
export type RateLimitFailureMode = "fail-closed" | "fail-open";

/**
 * Declarative rule evaluated by a rate-limit guard.
 *
 * @typeParam T - Input payload type evaluated by the guard.
 *
 * @public
 */
export type RateLimitRule<T> = {
  /** Stable rule identifier used for diagnostics and bucket naming. */
  id: string;
  /** Maximum number of allowed requests in each window. */
  limit: number;
  /** Function that maps input payload into a per-rule identifier. */
  resolveIdentifier(input: T): string;
  /** Rule window size in seconds. */
  windowSeconds: number;
};

/**
 * Storage abstraction for consuming rate-limit tokens.
 *
 * @public
 */
export type RateLimitStore = {
  /**
   * Consume one request from the target bucket/identifier pair.
   */
  consume(
    input: RateLimitConsumeInput,
  ): ResultAsync<RateLimitDecision, RichError>;
};

/**
 * Create a reusable guard that evaluates one or more rate-limit rules.
 *
 * @typeParam T - Input payload type evaluated by the guard.
 * @returns A function that resolves to `Ok<void>` when all rules pass, otherwise `Err<RichError>`.
 *
 * @public
 */
export function createRateLimitGuard<T>(
  options: CreateRateLimitGuardOptions<T>,
): (input: T) => ResultAsync<void, RichError> {
  const failureMode = options.failureMode ?? "fail-closed";

  return (input) => {
    let chain: ResultAsync<void, RichError> = okAsync(undefined);

    for (const rule of options.rules) {
      chain = chain.andThen(() =>
        evaluateRule(options, failureMode, rule, input),
      );
    }

    return chain;
  };
}

function evaluateRule<T>(
  options: CreateRateLimitGuardOptions<T>,
  failureMode: RateLimitFailureMode,
  rule: RateLimitRule<T>,
  input: T,
): ResultAsync<void, RichError> {
  return resolveRuleIdentifier(rule, input).andThen((identifier) =>
    options.store
      .consume({
        identifier,
        bucket: rule.id,
        limit: rule.limit,
        windowSeconds: rule.windowSeconds,
      })
      .orElse((error) => {
        if (failureMode === "fail-open") {
          try {
            options.onBypass?.({
              error,
              input,
              rule,
            });
          } catch {
            // Ignore bypass callback failures and continue fail-open behavior.
          }
          return okAsync<RateLimitDecision, RichError>({
            allowed: true,
            limit: rule.limit,
            remaining: 0,
            resetEpochSeconds: 0,
          });
        }
        return errAsync(error);
      })
      .andThen((decision) => {
        if (decision.allowed) {
          return okAsync(undefined);
        }

        const error =
          options.buildRateLimitedError?.({
            decision,
            input,
            rule,
          }) ??
          newRichError({
            code: "RATE_LIMIT_EXCEEDED",
            details: {
              action: "CheckRateLimit",
              reason: `Rate limit exceeded for rule: ${rule.id}.`,
            },
            i18n: { key: "errors.application.rate_limit" },
            isOperational: true,
            kind: "RateLimit",
            layer: "Application",
            meta: {
              limit: decision.limit,
              remaining: decision.remaining,
              resetEpochSeconds: decision.resetEpochSeconds,
              ruleId: rule.id,
            },
          });

        return errAsync(error);
      }),
  );
}

function resolveRuleIdentifier<T>(
  rule: RateLimitRule<T>,
  input: T,
): ResultAsync<string, RichError> {
  let rawIdentifier: unknown;

  try {
    rawIdentifier = rule.resolveIdentifier(input);
  } catch (cause) {
    return errAsync(
      newRichError({
        cause,
        code: "RATE_LIMIT_IDENTIFIER_INVALID",
        details: {
          action: "CheckRateLimit",
          reason: `Failed to resolve rate limit identifier for rule: ${rule.id}.`,
        },
        i18n: { key: "errors.application.internal" },
        isOperational: false,
        kind: "Internal",
        layer: "Application",
      }),
    );
  }

  if (typeof rawIdentifier !== "string") {
    return errAsync(
      newRichError({
        code: "RATE_LIMIT_IDENTIFIER_INVALID",
        details: {
          action: "CheckRateLimit",
          reason: `Rate limit identifier is not a string for rule: ${rule.id}.`,
        },
        i18n: { key: "errors.application.internal" },
        isOperational: false,
        kind: "Internal",
        layer: "Application",
      }),
    );
  }

  const identifier = rawIdentifier.trim();
  if (!identifier) {
    return errAsync(
      newRichError({
        code: "RATE_LIMIT_IDENTIFIER_INVALID",
        details: {
          action: "CheckRateLimit",
          reason: `Rate limit identifier is empty for rule: ${rule.id}.`,
        },
        i18n: { key: "errors.application.internal" },
        isOperational: false,
        kind: "Internal",
        layer: "Application",
      }),
    );
  }

  return okAsync(identifier);
}
