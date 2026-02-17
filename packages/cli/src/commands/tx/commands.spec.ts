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
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "table").mockImplementation(() => {});
  });

  it("runTxCreate maps args and prints created transaction JSON", async () => {
    h.createTransactionMock.mockResolvedValueOnce({
      id: "tx-1",
      amount: "1",
      currency: "USD",
      type: "BUY",
    });

    await runTxCreate({
      amount: "1",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      price: "100",
      type: "BUY",
    });

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
    h.updateTransactionMock.mockResolvedValueOnce(undefined);

    await runTxUpdate({
      id: "tx-2",
      amount: "2",
      price: "200",
      type: "SELL",
    });

    expect(h.updateTransactionMock).toHaveBeenCalledWith("tx-2", {
      amount: "2",
      price: "200",
      type: "SELL",
    });
    expect(console.log).toHaveBeenCalledWith("Updated.");
  });

  it("runTxDelete skips prompt when confirmed=true", async () => {
    h.deleteTransactionMock.mockResolvedValueOnce(undefined);

    await runTxDelete("tx-3", true);

    expect(h.questionMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionMock).toHaveBeenCalledWith("tx-3");
    expect(console.log).toHaveBeenCalledWith("Deleted.");
  });

  it("runTxDelete cancels when user does not confirm", async () => {
    h.questionMock.mockResolvedValueOnce("n");

    await runTxDelete("tx-4", false);

    expect(h.questionMock).toHaveBeenCalledTimes(1);
    expect(h.deleteTransactionMock).not.toHaveBeenCalled();
    expect(h.closeMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Canceled.");
  });

  it("runTxDelete proceeds when user confirms", async () => {
    h.questionMock.mockResolvedValueOnce("yes");
    h.deleteTransactionMock.mockResolvedValueOnce(undefined);

    await runTxDelete("tx-5", false);

    expect(h.questionMock).toHaveBeenCalledTimes(1);
    expect(h.deleteTransactionMock).toHaveBeenCalledWith("tx-5");
    expect(h.closeMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Deleted.");
  });

  it("runTxList prints JSON when asJson=true", async () => {
    h.listTransactionsMock.mockResolvedValueOnce([
      {
        id: "tx-6",
        amount: "1",
        type: "BUY",
      },
    ]);

    await runTxList(true);

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
    h.listTransactionsMock.mockResolvedValueOnce(rows);

    await runTxList(false);

    expect(console.table).toHaveBeenCalledWith(rows);
  });
});
