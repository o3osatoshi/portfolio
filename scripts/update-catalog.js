#!/usr/bin/env node

const { exec } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");

const execAsync = promisify(exec);

function compareSemver(a, b) {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

async function fetchVersions(name) {
  const { stdout } = await execAsync(`pnpm view "${name}" versions --json`, {
    encoding: "utf8",
  });

  try {
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => String(v));
    }
  } catch {
    // ignore and fall back to plain parsing below
  }

  const trimmed = stdout.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v));
      }
    } catch {
      // ignore
    }
  }

  return trimmed
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function parseArgs() {
  const [, , ...rest] = process.argv;
  const options = {
    includeBeta: false,
    includeCanary: false,
    includeDev: false,
    level: "major",
  };

  for (const arg of rest) {
    if (arg === "--major") {
      options.level = "major";
    } else if (arg === "--minor") {
      options.level = "minor";
    } else if (arg === "--patch") {
      options.level = "patch";
    } else if (arg === "--include-canary" || arg === "--allow-canary") {
      options.includeCanary = true;
    } else if (arg === "--include-beta" || arg === "--allow-beta") {
      options.includeBeta = true;
    } else if (arg === "--include-dev" || arg === "--allow-dev") {
      options.includeDev = true;
    }
  }

  return options;
}

function parseCatalogEntries(lines) {
  let inCatalog = false;
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!inCatalog) {
      if (trimmed === "catalog:" || trimmed.startsWith("catalog:")) {
        inCatalog = true;
      }
      continue;
    }

    if (!line.startsWith("  ") || trimmed === "") {
      inCatalog = false;
      continue;
    }

    if (trimmed.startsWith("#")) {
      continue;
    }

    const match = /^(\s*)([^:]+):(.*)$/.exec(line);
    if (!match) {
      continue;
    }

    const indent = match[1];
    const keyText = match[2].trim();
    const rest = match[3] ?? "";

    const commentIndex = rest.indexOf("#");
    let valueText;
    let comment;
    if (commentIndex === -1) {
      valueText = rest.trim();
      comment = "";
    } else {
      valueText = rest.slice(0, commentIndex).trim();
      comment = rest.slice(commentIndex);
    }

    if (!valueText) {
      continue;
    }

    let name = keyText;
    if (
      (name.startsWith("'") && name.endsWith("'")) ||
      (name.startsWith('"') && name.endsWith('"'))
    ) {
      name = name.slice(1, -1);
    }

    entries.push({
      name,
      comment,
      indent,
      keyText,
      lineIndex: index,
      range: valueText,
    });
  }

  return entries;
}

function parseSemver(version) {
  const clean = version.replace(/^[~^]/, "");
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(clean);
  if (!match) {
    return null;
  }
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    raw: version,
  };
}

function pickTargetVersion(
  range,
  versions,
  level,
  includeCanary,
  includeBeta,
  includeDev,
) {
  const source = versions.filter((version) => {
    const lower = version.toLowerCase();
    if (!includeCanary && lower.includes("canary")) {
      return false;
    }
    if (!includeBeta && lower.includes("beta")) {
      return false;
    }
    if (!includeDev && lower.includes("dev")) {
      return false;
    }
    return true;
  });

  if (source.length === 0) {
    return range.replace(/^[~^]/, "");
  }

  const base = parseSemver(range);
  const semvers = source.map((v) => parseSemver(v)).filter((v) => v !== null);

  if (semvers.length === 0) {
    return range.replace(/^[~^]/, "");
  }

  if (!base || level === "major") {
    return semvers.reduce(
      (best, v) => (!best || compareSemver(v, best) > 0 ? v : best),
      null,
    ).raw;
  }

  const filtered = semvers.filter((v) => {
    if (v.major !== base.major) {
      return false;
    }
    const cmp = compareSemver(v, base);
    if (cmp < 0) {
      return false;
    }
    if (level === "minor") {
      return true;
    }
    return v.minor === base.minor;
  });

  if (filtered.length === 0) {
    return range.replace(/^[~^]/, "");
  }

  return filtered.reduce(
    (best, v) => (!best || compareSemver(v, best) > 0 ? v : best),
    null,
  ).raw;
}

async function readWorkspaceFile() {
  const workspacePath = path.resolve(process.cwd(), "pnpm-workspace.yaml");
  return {
    content: await fs.readFile(workspacePath, "utf8"),
    workspacePath,
  };
}

async function updateCatalog() {
  const options = parseArgs();
  const { content, workspacePath } = await readWorkspaceFile();
  const lines = content.split(/\r?\n/);

  const entries = parseCatalogEntries(lines);
  if (entries.length === 0) {
    console.error("No catalog entries found in pnpm-workspace.yaml");
    process.exitCode = 1;
    return;
  }

  console.log(
    `Found ${entries.length} catalog entries. Updating with level="${options.level}", includeCanary=${options.includeCanary}, includeBeta=${options.includeBeta}, includeDev=${options.includeDev}...\n`,
  );

  await Promise.all(
    entries.map(async (entry) => {
      try {
        const versions = await fetchVersions(entry.name);
        const target = pickTargetVersion(
          entry.range,
          versions,
          options.level,
          options.includeCanary,
          options.includeBeta,
          options.includeDev,
        );
        const firstChar = entry.range[0];
        const prefix = firstChar === "^" || firstChar === "~" ? firstChar : "";
        entry.newRange = `${prefix}${target}`;
      } catch (error) {
        console.error(
          `Failed to resolve latest version for ${entry.name}:`,
          error.message ?? error,
        );
        entry.newRange = entry.range;
      }
    }),
  );

  for (const entry of entries) {
    const { comment, indent, keyText, lineIndex, newRange } = entry;
    const commentPart =
      comment && comment.trim().length > 0
        ? comment.startsWith(" ")
          ? comment
          : ` ${comment}`
        : "";
    lines[lineIndex] = `${indent}${keyText}: ${newRange}${commentPart}`;
  }

  await fs.writeFile(workspacePath, lines.join("\n"), "utf8");

  console.log("Updated pnpm-workspace.yaml catalog:\n");
  for (const entry of entries) {
    if (entry.newRange === entry.range) {
      console.log(`- ${entry.name}: ${entry.range} (no change)`);
    } else {
      console.log(`- ${entry.name}: ${entry.range} -> ${entry.newRange}`);
    }
  }
}

updateCatalog().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
