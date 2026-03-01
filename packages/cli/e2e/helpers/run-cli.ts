import { spawn } from "node:child_process";

export type RunCliOptions = {
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
};

export type RunCliResult = {
  exitCode: number;
  stderr: string;
  stdout: string;
};

export function parseJsonFromStdout(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error("Expected JSON output on stdout, but stdout was empty.");
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch (cause) {
    throw new Error(`Failed to parse stdout as JSON: ${trimmed}`, { cause });
  }
}

export async function runCli(options: RunCliOptions): Promise<RunCliResult> {
  return await new Promise<RunCliResult>((resolve, reject) => {
    const child = spawn(process.execPath, ["dist/bin.js", ...options.args], {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...options.env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.once("error", reject);
    child.once("close", (exitCode) => {
      resolve({
        exitCode: exitCode ?? 1,
        stderr,
        stdout,
      });
    });
  });
}
