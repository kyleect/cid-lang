import { Procedure } from "./procedure";
import { Sym } from "./symbol";

export type AtomicExpression = number | string | Sym | boolean;
export type ListExpression = (AtomicExpression | ListExpression)[];
export type Expression = AtomicExpression | ListExpression;
export type Program = Expression[];

export function isAtomicExpression(value: unknown): value is AtomicExpression {
  if (typeof value === "number") {
    return true;
  }

  if (typeof value === "string") {
    return true;
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (value instanceof Sym) {
    return true;
  }

  return false;
}

export function isListExpression(value: unknown): value is ListExpression {
  if (Array.isArray(value)) {
    return value.every((v) => isAtomicExpression(v) || isListExpression(v));
  }

  if (value instanceof Procedure) {
    return true;
  }

  return false;
}

export function isExpression(value: unknown): value is Expression {
  return isAtomicExpression(value) || isListExpression(value);
}
