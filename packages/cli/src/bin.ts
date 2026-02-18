#!/usr/bin/env node

import { runAuthLogin } from "./commands/auth/login";
import { runAuthLogout } from "./commands/auth/logout";
import { runAuthWhoami } from "./commands/auth/whoami";
import { runHello } from "./commands/hello";
import { runTxCreate } from "./commands/tx/create";
import { runTxDelete } from "./commands/tx/delete";
import { runTxList } from "./commands/tx/list";
import { runTxUpdate } from "./commands/tx/update";
import { hasFlag, parseArgs, readStringFlag } from "./lib/args";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [group, action] = args.positionals;

  if (group === "hello") {
    await runHello();
    return;
  }

  if (group === "auth" && action === "login") {
    const mode = hasFlag(args, "pkce")
      ? "pkce"
      : hasFlag(args, "device")
        ? "device"
        : "auto";
    await runAuthLogin(mode);
    return;
  }

  if (group === "auth" && action === "whoami") {
    await runAuthWhoami();
    return;
  }

  if (group === "auth" && action === "logout") {
    await runAuthLogout();
    return;
  }

  if (group === "tx" && action === "list") {
    await runTxList(hasFlag(args, "json"));
    return;
  }

  if (group === "tx" && action === "create") {
    const type = readStringFlag(args, "type");
    const datetime = readStringFlag(args, "datetime");
    const amount = readStringFlag(args, "amount");
    const price = readStringFlag(args, "price");
    const currency = readStringFlag(args, "currency");

    if (!type || !datetime || !amount || !price || !currency) {
      throw new Error(
        "tx create requires --type --datetime --amount --price --currency",
      );
    }

    if (type !== "BUY" && type !== "SELL") {
      throw new Error("--type must be BUY or SELL");
    }

    await runTxCreate({
      amount,
      currency,
      datetime,
      fee: readStringFlag(args, "fee"),
      feeCurrency: readStringFlag(args, "fee-currency"),
      price,
      profitLoss: readStringFlag(args, "profit-loss"),
      type,
    });
    return;
  }

  if (group === "tx" && action === "update") {
    const id = readStringFlag(args, "id");
    if (!id) throw new Error("tx update requires --id");

    const type = readStringFlag(args, "type");
    if (type && type !== "BUY" && type !== "SELL") {
      throw new Error("--type must be BUY or SELL");
    }

    await runTxUpdate({
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
    return;
  }

  if (group === "tx" && action === "delete") {
    const id = readStringFlag(args, "id");
    if (!id) throw new Error("tx delete requires --id");
    await runTxDelete(id, hasFlag(args, "yes"));
    return;
  }

  printHelp();
}

function printHelp() {
  console.log(`o3o CLI

Usage:
  o3o hello
  o3o auth login [--pkce|--device]
  o3o auth whoami
  o3o auth logout
  o3o tx list [--json]
  o3o tx create --type BUY|SELL --datetime <iso> --amount <num> --price <num> --currency <code>
  o3o tx update --id <id> [--type BUY|SELL] [--datetime <iso>] [--amount <num>] [--price <num>] [--currency <code>]
  o3o tx delete --id <id> [--yes]
`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
