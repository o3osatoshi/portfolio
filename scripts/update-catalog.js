#!/usr/bin/env node

const { exec } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");

const execAsync = promisify(exec);

async function fetchLatestVersion(name) {
  const { stdout } = await execAsync(`pnpm view "${name}" version`, {
    encoding: "utf8",
  });
  return stdout.trim();
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

async function readWorkspaceFile() {
  const workspacePath = path.resolve(process.cwd(), "pnpm-workspace.yaml");
  return {
    content: await fs.readFile(workspacePath, "utf8"),
    workspacePath,
  };
}

async function updateCatalog() {
  const { content, workspacePath } = await readWorkspaceFile();
  const lines = content.split(/\r?\n/);

  const entries = parseCatalogEntries(lines);
  if (entries.length === 0) {
    console.error("No catalog entries found in pnpm-workspace.yaml");
    process.exitCode = 1;
    return;
  }

  console.log(
    `Found ${entries.length} catalog entries. Fetching latest versions...\n`,
  );

  await Promise.all(
    entries.map(async (entry) => {
      try {
        const latest = await fetchLatestVersion(entry.name);
        const firstChar = entry.range[0];
        const prefix = firstChar === "^" || firstChar === "~" ? firstChar : "";
        entry.newRange = `${prefix}${latest}`;
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
