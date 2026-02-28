import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "./error";

/**
 * Options for creating a reusable rate-limit guard.
 *
 * @public
 */
export type CreateRateLimitGuardOptions<T> = {
  buildRateLimitedError?:
    | ((ctx: RateLimitExceededContext<T>) => RichError)
    | undefined;
  failureMode?: RateLimitFailureMode | undefined;
  onBypass?: ((ctx: RateLimitBypassContext<T>) => void) | undefined;
  rules: RateLimitRule<T>[];
  store: RateLimitStore;
};

/**
 * Context passed to `onBypass` when a store failure is bypassed in fail-open mode.
 *
 * @public
 */
export type RateLimitBypassContext<T> = {
  error: RichError;
  input: T;
  rule: RateLimitRule<T>;
};

/**
 * Input payload consumed by a rate-limit store implementation.
 *
 * @public
 */
export type RateLimitConsumeInput = {
  bucket: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

/**
 * Normalized decision returned by a rate-limit store.
 *
 * @public
 */
export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetEpochSeconds: number;
};

/**
 * Context used to build a custom rate-limited error.
 *
 * @public
 */
export type RateLimitExceededContext<T> = {
  decision: RateLimitDecision;
  input: T;
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
 * @public
 */
export type RateLimitRule<T> = {
  id: string;
  limit: number;
  resolveIdentifier(input: T): string;
  windowSeconds: number;
};

/**
 * Storage abstraction for consuming rate-limit tokens.
 *
 * @public
 */
export type RateLimitStore = {
  consume(
    input: RateLimitConsumeInput,
  ): ResultAsync<RateLimitDecision, RichError>;
};

/**
 * Create a reusable guard that evaluates one or more rate-limit rules.
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
