#!/usr/bin/env node

import { err, errAsync, ok, okAsync } from "neverthrow";

import { newRichError } from "@o3osatoshi/toolkit";

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
import { toCliErrorMessage } from "./lib/cli-error-message";
import { toAsync } from "./lib/cli-result";
import { loadRuntimeEnvFile } from "./lib/env-file";
import type { CliResult, CliResultAsync } from "./lib/types";

type GlobalOptions = {
  commandArgv: string[];
  envFilePath?: string | undefined;
};

export function main(
  argv: string[] = process.argv.slice(2),
): CliResultAsync<void> {
  return toAsync(extractGlobalOptions(argv)).andThen(
    ({ commandArgv, envFilePath }) =>
      loadRuntimeEnvFile(envFilePath).andThen(() => dispatch(commandArgv)),
  );
}

function dispatch(argv: string[]): CliResultAsync<void> {
  const args = parseArgs(argv);
  const [group, action] = args.positionals;

  if (group === "hello") {
    return runHello();
  }

  if (group === "auth" && action === "login") {
    const mode = hasFlag(args, "pkce")
      ? "pkce"
      : hasFlag(args, "device")
        ? "device"
        : "auto";
    return runAuthLogin(mode);
  }

  if (group === "auth" && action === "whoami") {
    return runAuthWhoami();
  }

  if (group === "auth" && action === "logout") {
    return runAuthLogout();
  }

  if (group === "tx" && action === "list") {
    return runTxList(hasFlag(args, "json"));
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

    return runTxCreate({
      amount,
      currency,
      datetime,
      fee: readStringFlag(args, "fee"),
      feeCurrency: readStringFlag(args, "fee-currency"),
      price,
      profitLoss: readStringFlag(args, "profit-loss"),
      type,
    });
  }

  if (group === "tx" && action === "update") {
    const id = readStringFlag(args, "id");
    if (!id) return invalidArgumentError("tx update requires --id");

    const type = readStringFlag(args, "type");
    if (type && type !== "BUY" && type !== "SELL") {
      return invalidArgumentError("--type must be BUY or SELL");
    }

    return runTxUpdate({
      id,
      amount: readStringFlag(args, "amount"),
      currency: readStringFlag(args, "currency"),
      datetime: readStringFlag(args, "datetime"),
      fee: readStringFlag(args, "fee"),
      feeCurrency: readStringFlag(args, "fee-currency"),
      price: readStringFlag(args, "price"),
      profitLoss: readStringFlag(args, "profit-loss"),
      type: type as "BUY" | "SELL" | undefined,
    });
  }

  if (group === "tx" && action === "delete") {
    const id = readStringFlag(args, "id");
    if (!id) return invalidArgumentError("tx delete requires --id");
    return runTxDelete(id, hasFlag(args, "yes"));
  }

  printHelp();
  return okAsync(undefined);
}

function extractGlobalOptions(argv: string[]): CliResult<GlobalOptions> {
  const commandArgv: string[] = [];
  let envFilePath: string | undefined;

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

    commandArgv.push(token);
  }

  return ok({
    commandArgv,
    envFilePath: envFilePath ?? process.env["O3O_ENV_FILE"],
  });
}

function invalidArgumentError(reason: string): CliResultAsync<void> {
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

function printHelp() {
  console.log(`o3o CLI

Usage:
  o3o [--env-file <path>] <command> [options]

Global options:
  --env-file <path>  Load env vars from file (env vars in shell take precedence)

Commands:
  o3o hello
  o3o auth login [--pkce|--device]
  o3o auth whoami
  o3o auth logout
  o3o tx list [--json]
  o3o tx create --type BUY|SELL --datetime <iso> --amount <num> --price <num> --currency <code> [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
  o3o tx update --id <id> [--type BUY|SELL] [--datetime <iso>] [--amount <num>] [--price <num>] [--currency <code>] [--fee <num>] [--fee-currency <code>] [--profit-loss <num>]
  o3o tx delete --id <id> [--yes]
`);
}

void main().match(
  () => undefined,
  (error) => {
    console.error(toCliErrorMessage(error));
    process.exitCode = 1;
  },
);
