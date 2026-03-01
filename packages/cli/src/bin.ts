#!/usr/bin/env node

import { stdin, stdout } from "node:process";

import {
  err,
  errAsync,
  ok,
  okAsync,
  type Result,
  type ResultAsync,
} from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { runAuthLogin } from "./commands/auth/login";
import { runAuthLogout } from "./commands/auth/logout";
import { runAuthWhoami } from "./commands/auth/whoami";
import { runHello } from "./commands/hello";
import { runTxCreate } from "./commands/tx/create";
import { runTxDelete } from "./commands/tx/delete";
import { runTxList } from "./commands/tx/list";
import { runTxUpdate } from "./commands/tx/update";
import { hasFlag, parseArgs, readStringFlag } from "./lib/args";
import { cliErrorCodes } from "./lib/cli-error-catalog";
import { toAsync } from "./lib/cli-result";
import { loadRuntimeEnvFile } from "./lib/env-file";
import { resolveCliExitCode } from "./lib/exit-code";
import {
  cliOutputSchemaVersion,
  type OutputMode,
  type OutputModeOption,
  printCliError,
} from "./lib/output";

type GlobalOptions = {
  commandArgv: string[];
  envFilePath?: string | undefined;
  outputMode: OutputModeOption;
};

const commandList = [
  "o3o hello",
  "o3o auth login [--pkce|--device]",
  "o3o auth whoami",
  "o3o auth logout",
  "o3o tx list [--json]",
  "o3o tx create --type BUY|SELL --datetime <iso> --amount <num> --price <num> --currency <code> [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]",
  "o3o tx update --id <id> [--type BUY|SELL] [--datetime <iso>] [--amount <num>] [--price <num>] [--currency <code>] [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]",
  "o3o tx delete --id <id> [--yes]",
] as const;

export function main(
  argv: string[] = process.argv.slice(2),
  resolvedOutputMode?: OutputMode,
): ResultAsync<void, RichError> {
  return toAsync(extractGlobalOptions(argv)).andThen(
    ({ commandArgv, envFilePath, outputMode }) => {
      const effectiveOutputMode =
        resolvedOutputMode ?? resolveEffectiveOutputMode(outputMode);

      return loadRuntimeEnvFile(envFilePath).andThen(() =>
        dispatch(commandArgv, effectiveOutputMode),
      );
    },
  );
}

function dispatch(
  argv: string[],
  outputMode: OutputMode,
): ResultAsync<void, RichError> {
  const args = parseArgs(argv);
  const [group, action] = args.positionals;

  if (group === "help" || hasFlag(args, "h") || hasFlag(args, "help")) {
    printHelp(outputMode);
    return okAsync(undefined);
  }

  if (group === "hello") {
    return runHello(outputMode);
  }

  if (group === "auth" && action === "login") {
    const mode = hasFlag(args, "pkce")
      ? "pkce"
      : hasFlag(args, "device")
        ? "device"
        : "auto";
    return runAuthLogin(mode, outputMode);
  }

  if (group === "auth" && action === "whoami") {
    return runAuthWhoami(outputMode);
  }

  if (group === "auth" && action === "logout") {
    return runAuthLogout(outputMode);
  }

  if (group === "tx" && action === "list") {
    return runTxList(hasFlag(args, "json"), outputMode);
  }

  if (group === "tx" && action === "create") {
    const type = readStringFlag(args, "type");
    const datetime = readStringFlag(args, "datetime");
    const amount = readStringFlag(args, "amount");
    const price = readStringFlag(args, "price");
    const currency = readStringFlag(args, "currency");

    if (!type || !datetime || !amount || !price || !currency) {
      return invalidArgumentError(
        "tx create requires --type --datetime --amount --price --currency",
      );
    }

    if (type !== "BUY" && type !== "SELL") {
      return invalidArgumentError("--type must be BUY or SELL");
    }

    return runTxCreate(
      {
        amount,
        currency,
        datetime,
        fee: readStringFlag(args, "fee"),
        feeCurrency: readStringFlag(args, "fee-currency"),
        price,
        profitLoss: readStringFlag(args, "profit-loss"),
        type,
      },
      outputMode,
    );
  }

  if (group === "tx" && action === "update") {
    const id = readStringFlag(args, "id");
    if (!id) return invalidArgumentError("tx update requires --id");

    const type = readStringFlag(args, "type");
    if (type && type !== "BUY" && type !== "SELL") {
      return invalidArgumentError("--type must be BUY or SELL");
    }

    return runTxUpdate(
      {
        id,
        amount: readStringFlag(args, "amount"),
        currency: readStringFlag(args, "currency"),
        datetime: readStringFlag(args, "datetime"),
        fee: readStringFlag(args, "fee"),
        feeCurrency: readStringFlag(args, "fee-currency"),
        price: readStringFlag(args, "price"),
        profitLoss: readStringFlag(args, "profit-loss"),
        type: type as "BUY" | "SELL" | undefined,
      },
      outputMode,
    );
  }

  if (group === "tx" && action === "delete") {
    const id = readStringFlag(args, "id");
    if (!id) return invalidArgumentError("tx delete requires --id");
    return runTxDelete(id, hasFlag(args, "yes"), outputMode);
  }

  if (!group) {
    printHelp(outputMode);
    return okAsync(undefined);
  }

  return invalidArgumentError(
    `Unknown command: ${args.positionals.join(" ")}. Run \`o3o help\`.`,
  );
}

function extractGlobalOptions(
  argv: string[],
): Result<GlobalOptions, RichError> {
  const commandArgv: string[] = [];
  let envFilePath: string | undefined;
  let outputMode: OutputModeOption = "auto";

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token) continue;

    if (token === "--env-file") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        return err(
          newRichError({
            code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
            details: {
              action: "ParseCliArguments",
              reason: "--env-file requires a non-empty path value",
            },
            isOperational: true,
            kind: "Validation",
            layer: "Presentation",
          }),
        );
      }
      envFilePath = value;
      i += 1;
      continue;
    }

    if (token.startsWith("--env-file=")) {
      const value = token.slice("--env-file=".length);
      if (!value.trim()) {
        return err(
          newRichError({
            code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
            details: {
              action: "ParseCliArguments",
              reason: "--env-file requires a non-empty path value",
            },
            isOperational: true,
            kind: "Validation",
            layer: "Presentation",
          }),
        );
      }
      envFilePath = value;
      continue;
    }

    if (token === "--output") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        return err(
          newRichError({
            code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
            details: {
              action: "ParseCliArguments",
              reason: "--output requires auto, text, or json",
            },
            isOperational: true,
            kind: "Validation",
            layer: "Presentation",
          }),
        );
      }
      if (!isOutputModeOption(value)) {
        return err(
          newRichError({
            code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
            details: {
              action: "ParseCliArguments",
              reason: "--output must be auto, text, or json",
            },
            isOperational: true,
            kind: "Validation",
            layer: "Presentation",
          }),
        );
      }
      outputMode = value;
      i += 1;
      continue;
    }

    if (token.startsWith("--output=")) {
      const value = token.slice("--output=".length);
      if (!isOutputModeOption(value)) {
        return err(
          newRichError({
            code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
            details: {
              action: "ParseCliArguments",
              reason: "--output must be auto, text, or json",
            },
            isOperational: true,
            kind: "Validation",
            layer: "Presentation",
          }),
        );
      }
      outputMode = value;
      continue;
    }

    commandArgv.push(token);
  }

  return ok({
    commandArgv,
    envFilePath: envFilePath ?? process.env["O3O_ENV_FILE"],
    outputMode,
  });
}

function extractRequestedOutputMode(argv: string[]): OutputModeOption {
  let mode: OutputModeOption = "auto";
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token) continue;
    if (token === "--output") {
      const value = argv[i + 1];
      if (value && isOutputModeOption(value)) {
        mode = value;
        i += 1;
      }
      continue;
    }
    if (token.startsWith("--output=")) {
      const value = token.slice("--output=".length);
      if (isOutputModeOption(value)) {
        mode = value;
      }
    }
  }
  return mode;
}

function invalidArgumentError(reason: string): ResultAsync<void, RichError> {
  return errAsync(
    newRichError({
      code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
      details: {
        action: "ParseCliArguments",
        reason,
      },
      isOperational: true,
      kind: "Validation",
      layer: "Presentation",
    }),
  );
}

function isInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stdout.isTTY === true;
}

function isOutputModeOption(value: string): value is OutputModeOption {
  return value === "auto" || value === "json" || value === "text";
}

function printHelp(outputMode: OutputMode) {
  if (outputMode === "json") {
    console.log(
      JSON.stringify({
        command: "help",
        data: {
          commands: commandList,
          globalOptions: {
            envFile:
              "--env-file <path> (load env vars from file; shell env has priority)",
            output:
              "--output <mode> (auto|text|json; auto selects json on non-TTY)",
          },
          usage:
            "o3o [--env-file <path>] [--output auto|text|json] <command> [options]",
        },
        meta: {
          schemaVersion: cliOutputSchemaVersion,
        },
        ok: true,
      }),
    );
    return;
  }

  console.log(`o3o CLI

Usage:
  o3o [--env-file <path>] [--output auto|text|json] <command> [options]

Global options:
  --env-file <path>  Load env vars from file (env vars in shell take precedence)
  --output <mode>    Output mode for humans or tools (auto|text|json)

Commands:
  ${commandList.join("\n  ")}
`);
}

function resolveEffectiveOutputMode(outputMode: OutputModeOption): OutputMode {
  if (outputMode === "auto") {
    return isInteractiveTerminal() ? "text" : "json";
  }
  return outputMode;
}

function resolveEffectiveOutputModeFromArgv(argv: string[]): OutputMode {
  return resolveEffectiveOutputMode(extractRequestedOutputMode(argv));
}

const invocationArgv = process.argv.slice(2);
const invocationOutputMode = resolveEffectiveOutputModeFromArgv(invocationArgv);

void main(invocationArgv, invocationOutputMode).match(
  () => undefined,
  (error) => {
    printCliError(error, invocationOutputMode);
    process.exitCode = resolveCliExitCode(error);
  },
);
