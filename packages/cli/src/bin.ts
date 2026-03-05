#!/usr/bin/env node

import { stdin, stdout } from "node:process";

import {
  Command,
  CommanderError,
  InvalidArgumentError,
  Option,
} from "commander";
import { okAsync, ResultAsync } from "neverthrow";

import { isRichError, newRichError, type RichError } from "@o3osatoshi/toolkit";

import { runAuthLogin } from "./commands/auth/login";
import { runAuthLogout } from "./commands/auth/logout";
import { runAuthWhoami } from "./commands/auth/whoami";
import { runHello } from "./commands/hello";
import { runTxCreate } from "./commands/tx/create";
import { runTxDelete } from "./commands/tx/delete";
import { runTxList } from "./commands/tx/list";
import { runTxUpdate } from "./commands/tx/update";
import { loadRuntimeEnvFile } from "./common/env-file";
import { cliErrorCodes } from "./common/error-catalog";
import { resolveCliExitCode } from "./common/exit-code";
import { type OutputMode, printCliError } from "./common/output";
import type { OidcLoginMode } from "./services/auth/oidc.service";

type GlobalCliOptions = {
  debug?: boolean | undefined;
  envFile?: string | undefined;
  output?: OutputMode | undefined;
};

type TransactionType = "BUY" | "SELL";

type TxCreateOptions = {
  amount: string;
  currency: string;
  datetime: string;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  price: string;
  profitLoss?: string | undefined;
  type: TransactionType;
};

type TxDeleteOptions = {
  id: string;
  yes: boolean;
};

type TxUpdateOptions = {
  amount?: string | undefined;
  currency?: string | undefined;
  datetime?: string | undefined;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  id: string;
  price?: string | undefined;
  profitLoss?: string | undefined;
  type?: TransactionType | undefined;
};

export function main(
  argv: string[] = process.argv.slice(2),
  resolvedOutputMode?: OutputMode,
): ResultAsync<void, RichError> {
  const outputMode =
    resolvedOutputMode ?? resolveEffectiveOutputModeFromArgv(argv);
  const program = createProgram(outputMode);

  if (argv.length === 0) {
    program.outputHelp();
    return okAsync(undefined);
  }

  return ResultAsync.fromPromise(
    program
      .parseAsync(argv, { from: "user" })
      .then(() => undefined)
      .catch((cause) => {
        if (
          cause instanceof CommanderError &&
          cause.code === "commander.helpDisplayed"
        ) {
          return undefined;
        }
        throw cause;
      }),
    (cause) => toCliInvocationError(cause),
  );
}

function createProgram(outputMode: OutputMode): Command {
  const program = new Command();
  let envLoaded = false;

  program
    .name("o3o")
    .description("Official o3o command-line interface")
    .option("--debug", "Enable verbose diagnostics for errors")
    .option(
      "--env-file <path>",
      "Load env vars from file (env vars in shell take precedence)",
      parseNonEmptyString("--env-file"),
    )
    .addOption(
      new Option("--output <mode>", "Output mode for humans or tools").choices([
        "text",
        "json",
      ]),
    )
    .configureOutput({
      outputError: () => undefined,
    })
    .exitOverride()
    .hook("preAction", async () => {
      if (envLoaded) return;
      const options = program.opts<GlobalCliOptions>();
      const envFilePath = options.envFile ?? process.env["O3O_ENV_FILE"];
      await runResult(loadRuntimeEnvFile(envFilePath));
      envLoaded = true;
    });

  program
    .command("hello")
    .description("Print hello message")
    .action(async () => {
      await runResult(runHello(outputMode));
    });

  const auth = program.command("auth").description("Authentication commands");

  auth
    .command("login")
    .description("Authenticate with OIDC")
    .addOption(
      new Option("--mode <mode>", "Login mode")
        .choices(["auto", "pkce", "device"])
        .default("auto"),
    )
    .action(async ({ mode }: { mode: OidcLoginMode }) => {
      await runResult(runAuthLogin(mode, outputMode));
    });

  auth
    .command("whoami")
    .description("Show the authenticated principal")
    .action(async () => {
      await runResult(runAuthWhoami(outputMode));
    });

  auth
    .command("logout")
    .description("Clear local tokens and revoke refresh token")
    .action(async () => {
      await runResult(runAuthLogout(outputMode));
    });

  const tx = program.command("tx").description("Transaction commands");

  tx.command("list")
    .description("List transactions")
    .action(async () => {
      await runResult(runTxList(outputMode));
    });

  tx.command("create")
    .description("Create a transaction")
    .addOption(
      new Option("--type <type>", "Transaction type")
        .choices(["BUY", "SELL"])
        .makeOptionMandatory(),
    )
    .requiredOption("--datetime <iso>", "ISO8601 datetime")
    .requiredOption("--amount <num>", "Amount")
    .requiredOption("--price <num>", "Price")
    .requiredOption("--currency <code>", "Currency code")
    .option("--fee <num>", "Fee")
    .option("--fee-currency <code>", "Fee currency code")
    .option("--profit-loss <num>", "Profit/loss")
    .action(async (options: TxCreateOptions) => {
      await runResult(
        runTxCreate(
          {
            amount: options.amount,
            currency: options.currency,
            datetime: options.datetime,
            fee: options.fee,
            feeCurrency: options.feeCurrency,
            price: options.price,
            profitLoss: options.profitLoss,
            type: options.type,
          },
          outputMode,
        ),
      );
    });

  tx.command("update")
    .description("Update a transaction")
    .requiredOption("--id <id>", "Transaction ID", parseNonEmptyString("--id"))
    .addOption(
      new Option("--type <type>", "Transaction type").choices(["BUY", "SELL"]),
    )
    .option("--datetime <iso>", "ISO8601 datetime")
    .option("--amount <num>", "Amount")
    .option("--price <num>", "Price")
    .option("--currency <code>", "Currency code")
    .option("--fee <num>", "Fee")
    .option("--fee-currency <code>", "Fee currency code")
    .option("--profit-loss <num>", "Profit/loss")
    .action(async (options: TxUpdateOptions) => {
      await runResult(
        runTxUpdate(
          {
            id: options.id,
            amount: options.amount,
            currency: options.currency,
            datetime: options.datetime,
            fee: options.fee,
            feeCurrency: options.feeCurrency,
            price: options.price,
            profitLoss: options.profitLoss,
            type: options.type,
          },
          outputMode,
        ),
      );
    });

  tx.command("delete")
    .description("Delete a transaction")
    .requiredOption("--id <id>", "Transaction ID", parseNonEmptyString("--id"))
    .option("--yes", "Skip confirmation prompt", false)
    .action(async (options: TxDeleteOptions) => {
      await runResult(runTxDelete(options.id, options.yes, outputMode));
    });

  return program;
}

function extractRequestedOutputMode(argv: string[]): OutputMode | undefined {
  let requested: OutputMode | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token) continue;

    if (token === "--output") {
      const value = argv[i + 1];
      if (!value) continue;
      if (value === "json" || value === "text") {
        requested = value;
      }
      i += 1;
      continue;
    }

    if (token.startsWith("--output=")) {
      const value = token.slice("--output=".length);
      if (value === "json" || value === "text") {
        requested = value;
      }
    }
  }

  return requested;
}

function isInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stdout.isTTY === true;
}

function normalizeCommanderMessage(message: string): string {
  const trimmed = message.replace(/^error:\s*/i, "").trim();
  return trimmed || "Failed to parse command arguments.";
}

function parseNonEmptyString(optionName: string) {
  return (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new InvalidArgumentError(
        `${optionName} requires a non-empty value`,
      );
    }
    return trimmed;
  };
}

function resolveDebugModeFromArgv(argv: string[]): boolean {
  return argv.includes("--debug");
}

function resolveEffectiveOutputModeFromArgv(argv: string[]): OutputMode {
  const requested = extractRequestedOutputMode(argv);
  if (requested) return requested;
  return isInteractiveTerminal() ? "text" : "json";
}

async function runResult(
  resultAsync: ResultAsync<void, RichError>,
): Promise<void> {
  const result = await resultAsync;
  if (result.isErr()) {
    throw result.error;
  }
}

function toCliInvocationError(cause: unknown): RichError {
  if (isRichError(cause)) {
    return cause;
  }

  if (cause instanceof CommanderError) {
    return newRichError({
      cause,
      code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
      details: {
        action: "ParseCliArguments",
        reason: normalizeCommanderMessage(cause.message),
      },
      isOperational: true,
      kind: "Validation",
      layer: "Presentation",
    });
  }

  if (cause instanceof Error) {
    return newRichError({
      cause,
      code: cliErrorCodes.CLI_INTERNAL_ERROR,
      details: {
        action: "ExecuteCliCommand",
        reason:
          cause.message || "Unexpected error during CLI command execution.",
      },
      isOperational: false,
      kind: "Internal",
      layer: "Application",
    });
  }

  return newRichError({
    cause,
    code: cliErrorCodes.CLI_INTERNAL_ERROR,
    details: {
      action: "ExecuteCliCommand",
      reason: "Unexpected error during CLI command execution.",
    },
    isOperational: false,
    kind: "Internal",
    layer: "Application",
  });
}

const invocationArgv = process.argv.slice(2);
const invocationOutputMode = resolveEffectiveOutputModeFromArgv(invocationArgv);
const invocationDebugMode = resolveDebugModeFromArgv(invocationArgv);

void main(invocationArgv, invocationOutputMode).match(
  () => undefined,
  (error) => {
    printCliError(error, invocationOutputMode, undefined, {
      debug: invocationDebugMode,
    });
    process.exitCode = resolveCliExitCode(error);
  },
);
