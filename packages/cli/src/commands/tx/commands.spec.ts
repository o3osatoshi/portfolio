import { okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  closeMock: vi.fn(),
  createTransactionMock: vi.fn(),
  deleteTransactionMock: vi.fn(),
  listTransactionsMock: vi.fn(),
  questionMock: vi.fn(),
  updateTransactionMock: vi.fn(),
}));

vi.mock("../../lib/api-client", () => ({
  createTransaction: h.createTransactionMock,
  deleteTransaction: h.deleteTransactionMock,
  listTransactions: h.listTransactionsMock,
  updateTransaction: h.updateTransactionMock,
}));

vi.mock("node:readline/promises", () => ({
  createInterface: () => ({
    close: h.closeMock,
    question: h.questionMock,
  }),
}));

import { runTxCreate } from "./create";
import { runTxDelete } from "./delete";
import { runTxList } from "./list";
import { runTxUpdate } from "./update";

describe("commands/tx", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    h.createTransactionMock.mockReset();
    h.updateTransactionMock.mockReset();
    h.deleteTransactionMock.mockReset();
    h.listTransactionsMock.mockReset();
    h.questionMock.mockReset();
    h.closeMock.mockReset();
    h.createTransactionMock.mockReturnValue(okAsync(undefined));
    h.updateTransactionMock.mockReturnValue(okAsync(undefined));
    h.deleteTransactionMock.mockReturnValue(okAsync(undefined));
    h.listTransactionsMock.mockReturnValue(okAsync([]));
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "table").mockImplementation(() => {});

    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });
  });

  it("runTxCreate maps args and prints created transaction JSON", async () => {
    h.createTransactionMock.mockReturnValueOnce(
      okAsync({
        id: "tx-1",
        amount: "1",
        currency: "USD",
        type: "BUY",
      }),
    );

    const result = await runTxCreate({
      amount: "1",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      price: "100",
      type: "BUY",
    });

    expect(result.isOk()).toBe(true);
    expect(h.createTransactionMock).toHaveBeenCalledWith({
      amount: "1",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      price: "100",
      type: "BUY",
    });
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        {
          id: "tx-1",
          amount: "1",
          currency: "USD",
          type: "BUY",
        },
        null,
        2,
      ),
    );
  });

  it("runTxUpdate maps partial args and prints completion message", async () => {
    h.updateTransactionMock.mockReturnValueOnce(okAsync(undefined));

    const result = await runTxUpdate({
      id: "tx-2",
      amount: "2",
      price: "200",
      type: "SELL",
    });

    expect(result.isOk()).toBe(true);
    expect(h.updateTransactionMock).toHaveBeenCalledWith("tx-2", {
      amount: "2",
      price: "200",
      type: "SELL",
    });
    expect(console.log).toHaveBeenCalledWith("Updated.");
  });

  it("runTxDelete skips prompt when confirmed=true", async () => {
    h.deleteTransactionMock.mockReturnValueOnce(okAsync(undefined));

    const result = await runTxDelete("tx-3", true);

    expect(result.isOk()).toBe(true);
    expect(h.questionMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionMock).toHaveBeenCalledWith("tx-3");
    expect(console.log).toHaveBeenCalledWith("Deleted.");
  });

  it("runTxDelete cancels when user does not confirm", async () => {
    h.questionMock.mockResolvedValueOnce("n");

    const result = await runTxDelete("tx-4", false);

    expect(result.isOk()).toBe(true);
    expect(h.questionMock).toHaveBeenCalledTimes(1);
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
    expect(h.closeMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Canceled.");
  });

  it("runTxDelete proceeds when user confirms", async () => {
    h.questionMock.mockResolvedValueOnce("yes");
    h.deleteTransactionMock.mockReturnValueOnce(okAsync(undefined));

    const result = await runTxDelete("tx-5", false);

    expect(result.isOk()).toBe(true);
    expect(h.questionMock).toHaveBeenCalledTimes(1);
    expect(h.deleteTransactionMock).toHaveBeenCalledWith("tx-5");
    expect(h.closeMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Deleted.");
  });

  it("runTxDelete returns local prompt error when confirmation input fails", async () => {
    h.questionMock.mockRejectedValueOnce(new Error("stdin unavailable"));

    const result = await runTxDelete("tx-prompt-failed", false, "text");

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_PROMPT_READ_FAILED");
    expect(result.error.details?.reason).toBe(
      "Failed to read confirmation input.",
    );
    expect(h.closeMock).toHaveBeenCalledTimes(1);
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
  });

  it("runTxList prints JSON when asJson=true", async () => {
    h.listTransactionsMock.mockReturnValueOnce(
      okAsync([
        {
          id: "tx-6",
          amount: "1",
          type: "BUY",
        },
      ]),
    );

    const result = await runTxList(true);

    expect(result.isOk()).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        [
          {
            id: "tx-6",
            amount: "1",
            type: "BUY",
          },
        ],
        null,
        2,
      ),
    );
    expect(console.table).not.toHaveBeenCalled();
  });

  it("runTxList prints table when asJson=false", async () => {
    const rows = [
      {
        id: "tx-7",
        amount: "1",
        type: "BUY",
      },
    ];
    h.listTransactionsMock.mockReturnValueOnce(okAsync(rows));

    const result = await runTxList(false);

    expect(result.isOk()).toBe(true);
    expect(console.table).toHaveBeenCalledWith(rows);
  });

  it("runTxList prints machine-readable envelope in json output mode", async () => {
    const rows = [
      {
        id: "tx-8",
        amount: "1",
        type: "BUY",
      },
    ];
    h.listTransactionsMock.mockReturnValueOnce(okAsync(rows));

    const result = await runTxList(false, "json");

    expect(result.isOk()).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({
        command: "tx.list",
        data: rows,
        meta: {
          schemaVersion: "v1",
        },
        ok: true,
      }),
    );
    expect(console.table).not.toHaveBeenCalled();
  });

  it("runTxDelete requires --yes in json output mode", async () => {
    const result = await runTxDelete("tx-9", false, "json");

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(result.error.details?.reason).toBe(
      "tx delete requires --yes when --output json is used.",
    );
    expect(h.questionMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
  });

  it("runTxDelete requires --yes in non-interactive mode", async () => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: false,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: false,
    });

    const result = await runTxDelete("tx-10", false, "text");

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(result.error.details?.reason).toBe(
      "tx delete requires --yes in non-interactive mode.",
    );
    expect(h.questionMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
  });

  it("runTxDelete requires --yes when tty flags are undefined", async () => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: undefined,
    });

    const result = await runTxDelete("tx-11", false, "text");

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(result.error.details?.reason).toBe(
      "tx delete requires --yes in non-interactive mode.",
    );
    expect(h.questionMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
  });

  it("runTxDelete requires --yes when only one tty stream is interactive", async () => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: undefined,
    });

    const result = await runTxDelete("tx-12", false, "text");

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(result.error.details?.reason).toBe(
      "tx delete requires --yes in non-interactive mode.",
    );
    expect(h.questionMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
  });
});
