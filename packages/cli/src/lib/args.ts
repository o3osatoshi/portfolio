export type ParsedArgs = {
  flags: Record<string, boolean | string>;
  positionals: string[];
};

export function hasFlag(args: ParsedArgs, key: string): boolean {
  return args.flags[key] === true;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, boolean | string> = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token) continue;

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const flagToken = token.slice(2);
    const eqIndex = flagToken.indexOf("=");
    if (eqIndex >= 0) {
      const key = flagToken.slice(0, eqIndex);
      const value = flagToken.slice(eqIndex + 1);
      flags[key] = value;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags[flagToken] = next;
      i += 1;
      continue;
    }

    flags[flagToken] = true;
  }

  return { flags, positionals };
}

export function readStringFlag(
  args: ParsedArgs,
  key: string,
): string | undefined {
  const value = args.flags[key];
  return typeof value === "string" ? value : undefined;
}
