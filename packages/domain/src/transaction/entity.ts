import type { Base, BaseType } from "../base";

interface TransactionDomainType {
  type: string;
  datetime: Date;
  amount: number;
  price: number;
  currency: string;
  profitLoss?: number;
  fee?: number;
  feeCurrency?: string;
  userId: string;
}

export type CreateTransaction = TransactionDomainType;
export type UpdateTransaction = Partial<TransactionDomainType> &
  Required<Pick<BaseType, "id">>;

type TransactionProps = BaseType & TransactionDomainType;

export class Transaction implements Base {
  constructor(private readonly props: TransactionProps) {}

  get id() {
    return this.props.id;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  equals(other: Transaction): boolean {
    return this.id === other.id;
  }

  get type() {
    return this.props.type;
  }
  get datetime() {
    return this.props.datetime;
  }
  get amount() {
    return this.props.amount;
  }
  get price() {
    return this.props.price;
  }
  get currency() {
    return this.props.currency;
  }
  get profitLoss() {
    return this.props.profitLoss;
  }
  get fee() {
    return this.props.fee;
  }
  get feeCurrency() {
    return this.props.feeCurrency;
  }
  get userId() {
    return this.props.userId;
  }
}
