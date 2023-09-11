import { Cell } from "./cell";
import { CIDLangRuntimeError } from "./errors";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

export type NumericExpression = number;
export type StringExpression = string;
export type BooleanExpression = boolean;

/**
 * Single value, non list expressions
 *
 * - 123
 * - "Hello World"
 * - Sym.of("a")
 * - true/false
 */
export type AtomicExpression =
  | NumericExpression
  | StringExpression
  | Sym
  | BooleanExpression;

/**
 * Tuple/pair value expression
 *
 * - Cell.of(1, 2) => (1 . 2)
 * - Cell.list(1, 2) => (1 . (2 . ())) => (1 2)
 */
export type PairExpression = Cell;

/**
 * Null/empty list expression
 *
 * - ()
 * - '()
 * - (list)
 * - Cell.list()
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
 * - Cell.list()
 */
export const NullExpression: [] = [];

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
    Object.is(value, NullExpression) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return true;
  }

  if (value instanceof Procedure) {
    return true;
  }

  return false;
}

export function isNotAnExpression(value: unknown): value is unknown {
  return !isExpression(value);
}

export function assertIsExpression(
  value: unknown,
  message = `Value must be an expression: ${value}`
): asserts value is Expression {
  if (!isExpression(value)) {
    throw new CIDLangRuntimeError(message);
  }
}

export function assertIsListExpression(
  value: unknown
): asserts value is ListExpression {
  if (!isListExpression(value)) {
    throw new CIDLangRuntimeError(`Value must be a list expression: ${value}`);
  }
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
  if (!isExpression(a) || !isExpression(b)) {
    throw new CIDLangRuntimeError(`Arguments must be expressions: ${a}, ${b}`);
  }
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
