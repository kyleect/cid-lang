import { Cell } from "./cell";
import { CIDLangRuntimeError } from "./errors";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

/**
 * Single value, non list expressions
 *
 * - 123
 * - "Hello World"
 * - 'abc
 * - #t #f
 */
export type AtomicExpression = number | string | Sym | boolean;

/**
 * Tuple/pair value expression
 *
 * - (1 . 2)
 * - (1 . (2 . ()))
 */
export type PairExpression = Cell;

/**
 * Null/empty list expression
 *
 * - ()
 * - '()
 * - (list)
 */
export type NullExpression = [];

/**
 * Pair or empty list expression
 *
 * () '() (1 . 2) (1 2 3) (list 1 2 3)
 */
export type ListExpression = PairExpression | NullExpression;

/**
 * Atomic or list expression
 */
export type Expression = AtomicExpression | ListExpression;

/**
 * One or more expressions
 */
export type Program = Expression[];

/**
 * Common reference for empty lists
 *
 * - ()
 * - '()
 * - (list)
 */
export const EmptyListExpression: NullExpression = [];

/**
 * Check if value is a pair expression
 * @param value Value to check
 * @returns If value is a pair expression
 */
export function isPairExpression(value: unknown): value is PairExpression {
  return value instanceof Cell;
}

/**
 * Check if value is an atomic expression
 * @param value Value to check
 * @returns If value is an atomic expression
 */
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

/**
 * Check if value is a list expression
 * @param value Value to check
 * @returns If value is a list expression
 */
export function isListExpression(value: unknown): value is ListExpression {
  if (isPairExpression(value)) {
    return true;
  }

  if (
    Object.is(value, EmptyListExpression) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return true;
  }

  if (value instanceof Procedure) {
    return true;
  }

  return false;
}

/**
 * Checks if value is a program
 * @param value Value to check
 * @returns If value is a program
 */
export function isProgram(value: unknown): value is Program {
  return Array.isArray(value) && value.every(isExpression);
}

/**
 * Check if value is an expression
 * @param value Value to check
 * @returns If value is an expression
 */
export function isExpression(value: unknown): value is Expression {
  return isAtomicExpression(value) || isListExpression(value);
}

export function cons(a: unknown, b: unknown) {
  return Cell.of(a, b);
}

export function car(value: unknown) {
  if (!isPairExpression(value)) {
    throw new CIDLangRuntimeError(
      `Argument must be a pair expression: ${value}`
    );
  }
  return value.car;
}

export function cdr(value: unknown) {
  if (isListExpression(value)) {
    if (isPairExpression(value)) {
      return value.cdr;
    }

    return value;
  }

  throw new CIDLangRuntimeError(`Argument must be a list expression: ${value}`);
}
