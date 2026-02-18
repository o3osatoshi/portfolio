import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "../error";

export type CreateRateLimitGuardOptions<T> = {
  buildRateLimitedError?:
    | ((ctx: RateLimitExceededContext<T>) => RichError)
    | undefined;
  failureMode?: RateLimitFailureMode | undefined;
  onBypass?: ((ctx: RateLimitBypassContext<T>) => void) | undefined;
  rules: RateLimitRule<T>[];
  store: RateLimitStore;
};

export type RateLimitBypassContext<T> = {
  error: RichError;
  input: T;
  rule: RateLimitRule<T>;
};

export type RateLimitConsumeInput = {
  bucket: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetEpochSeconds: number;
};

export type RateLimitExceededContext<T> = {
  decision: RateLimitDecision;
  input: T;
  rule: RateLimitRule<T>;
};

export type RateLimitFailureMode = "fail-closed" | "fail-open";

export type RateLimitRule<T> = {
  id: string;
  limit: number;
  resolveIdentifier(input: T): string;
  windowSeconds: number;
};

export type RateLimitStore = {
  consume(
    input: RateLimitConsumeInput,
  ): ResultAsync<RateLimitDecision, RichError>;
};

export function createRateLimitGuard<T>(
  options: CreateRateLimitGuardOptions<T>,
) {
  const failureMode = options.failureMode ?? "fail-closed";

  return (input: T): ResultAsync<void, RichError> => {
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
  const identifier = rule.resolveIdentifier(input).trim();
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

  return options.store
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
    });
}
