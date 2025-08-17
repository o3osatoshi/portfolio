export interface BaseType {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Base {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  equals(other: Base): boolean;
}
