#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("[ensure-use-client] No target files provided");
  process.exit(1);
}

for (const t of targets) {
  const file = resolve(process.cwd(), t);
  if (!existsSync(file)) {
    console.warn(`[ensure-use-client] Skip: not found ${file}`);
    continue;
  }
  const src = readFileSync(file, "utf8");
  const trimmed = src.trimStart();
  const hasDirective =
    trimmed.startsWith('"use client";') || trimmed.startsWith("'use client';");
  if (hasDirective) {
    continue;
  }
  const out = `"use client";\n\n${src}`;
  writeFileSync(file, out, "utf8");
  console.log(`[ensure-use-client] Prepended use client to ${t}`);
}
