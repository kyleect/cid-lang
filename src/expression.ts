import { Cell } from "./cell";
import { CIDLangRuntimeError } from "./errors";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

export type NumericExpression = number;
export type StringExpression = string;
export type BooleanExpression = boolean;
export type SymbolExpression = Sym;

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
  | SymbolExpression
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
  if (isNumericExpression(value)) {
    return true;
  }

  if (isStringExpression(value)) {
    return true;
  }

  if (isBooleanExpression(value)) {
    return true;
  }

  if (isSymbolExpression(value)) {
    return true;
  }

  return false;
}

/**
 * Check if value is a numeric expression
 * @param value Value to check
 * @returns If value is a numeric expression
 */
export function isNumericExpression(
  value: unknown
): value is NumericExpression {
  return typeof value === "number";
}

/**
 * Check if value is a string expression
 * @param value Value to check
 * @returns If value is a string expression
 */
export function isStringExpression(value: unknown): value is NumericExpression {
  return typeof value === "string";
}

/**
 * Check if value is a boolean expression
 * @param value Value to check
 * @returns If value is a boolean expression
 */
export function isBooleanExpression(
  value: unknown
): value is BooleanExpression {
  return typeof value === "boolean";
}

/**
 * Check if value is a symbol expression
 * @param value Value to check
 * @returns If value is a symbol expression
 */
export function isSymbolExpression(value: unknown): value is SymbolExpression {
  return Sym.is(value);
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

/**
 * Check if value is not an expression
 * @param value Value to check
 * @returns If value is not an list expression
 */
export function isNotAnExpression(value: unknown): value is unknown {
  return !isExpression(value);
}

/**
 * Assert if value is an expression
 * @param value Value to check
 */
export function assertIsExpression(
  value: unknown,
  message = `Value must be an expression: ${value}`
): asserts value is Expression {
  if (!isExpression(value)) {
    throw new CIDLangRuntimeError(message);
  }
}

/**
 * Assert value is a list expression
 * @param value Value to check
 */
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
