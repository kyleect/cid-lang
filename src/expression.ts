import { CIDLangRuntimeError } from "./errors";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

export type AtomicExpression = number | string | Sym | boolean;
export type ListExpression = (AtomicExpression | ListExpression)[];
export type Expression = AtomicExpression | ListExpression;
export type Program = Expression[];

export const EmptyListExpression: ListExpression = [];

export const IsPairSymbol = Symbol("CID:IsPair");

export function isPairExpression(value: unknown): value is ListExpression {
  return isListExpression(value) && value.length > 0;
}

export function cons(a: unknown, b: unknown) {
  let pair;

  if (isListExpression(b)) {
    if (isPairExpression(b)) {
      pair = [a, b];
    } else {
      pair = [a, ...b];
    }
  } else {
    pair = [a, b];
  }

  pair[IsPairSymbol] = IsPairSymbol;

  return pair;
}

export function car(value: unknown) {
  if (!isPairExpression(value)) {
    throw new CIDLangRuntimeError(
      `Argument must be a pair expression: ${value}`
    );
  }
  return value[0];
}

export function cdr(value: unknown) {
  if (!isListExpression(value)) {
    throw new CIDLangRuntimeError(
      `Argument must be a list expression: ${value}`
    );
  }

  const [_, ...args] = value;

  if (args.length === 0) {
    return EmptyListExpression;
  }

  return args;
}

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

  if (Sym.is(value)) {
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
