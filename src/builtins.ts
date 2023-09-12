import { Cell } from "./cell";
import { CIDLangError, CIDLangRuntimeError } from "./errors";
import { isExpression, isListExpression, isPairExpression } from "./expression";
import { Sym } from "./symbol";

// Math

/**
 * Add two numbers together
 *
 * @param a Number to add
 * @param b Number to add
 * @returns Sum to `a` and `b`
 */
export function sum(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a + b;
}

/**
 * Subtract two numbers
 *
 * @param a Number to subtract from
 * @param b Number to subtract
 * @returns Subtraction of `a` and `b`
 */
export function sub(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a - b;
}

/**
 * Multiply two numbers
 *
 * @param a Number to multiply against
 * @param b Number to multiply
 * @returns Multiplication of `a` and `b`
 */
export function multiply(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a * b;
}

/**
 * Divide two numbers
 *
 * @param a Number to divide against
 * @param b Number to divide
 * @returns Division of `a` and `b`
 */
export function divide(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  if (a === 0 || b === 0) {
    throw new CIDLangError("Dividing by zero");
  }

  return a / b;
}

/**
 * Check if number is greater than number
 *
 * @param a Number to check
 * @param b Number to compare
 * @returns Division of `a` and `b`
 */
export function greaterThan(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a > b;
}

/**
 * Check if number is less than number
 *
 * @param a Number to check
 * @param b Number to compare
 * @returns Division of `a` and `b`
 */
export function lessThan(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a < b;
}

/**
 * Check if number is greater than or equal to number
 *
 * @param a Number to check
 * @param b Number to compare
 * @returns Division of `a` and `b`
 */
export function greaterThanOrEqual(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a >= b;
}

/**
 * Check if number is less than or equal to number
 *
 * @param a Number to check
 * @param b Number to compare
 * @returns Division of `a` and `b`
 */
export function lessThanOrEqual(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new CIDLangError("All arguments must be numbers");
  }

  return a <= b;
}

// Lists, Cells, Pairs

/**
 * Create a Cell from `a` and `b` values
 * @param a Car value
 * @param b Cdr value
 * @returns Cell of `a` and `b` values
 */
export function cons(a: unknown, b: unknown) {
  if (!isExpression(a) || !isExpression(b)) {
    throw new CIDLangRuntimeError(`Arguments must be expressions: ${a}, ${b}`);
  }
  return Cell.of(a, b);
}

/**
 * Get car value from value
 * @param value Value to get car value from
 * @returns Car value from value
 */
export function car(value: unknown) {
  if (!isPairExpression(value)) {
    throw new CIDLangRuntimeError(
      `Argument must be a pair expression: ${value}`
    );
  }
  return value.car;
}

/**
 * Get cdr value from value
 * @param value Value to get cdr value from
 * @returns Cdr value from value
 */
export function cdr(value: unknown) {
  if (isListExpression(value)) {
    if (isPairExpression(value)) {
      return value.cdr;
    }

    return value;
  }

  throw new CIDLangRuntimeError(`Argument must be a list expression: ${value}`);
}

// Strings

/**
 * Append values in to a string
 * @param values Values to append
 * @returns String of appended values
 */
export function stringAppend(...values: unknown[]) {
  return values.join(" ");
}

// Compare

/**
 * Check if value is equal to value
 *
 * @param a Value to check
 * @param b Value to compare
 * @returns If `a` and `b` are equal
 */
export function isEqual(a: unknown, b: unknown) {
  if (Sym.is(a) && Sym.is(b)) {
    return a.name === b.name;
  }

  return Object.is(a, b);
}

// System

/**
 * Display values
 * @param args Values to display
 */
export function display(...values: unknown[]) {
  console.log(...values);
}

/**
 * Exit with exit code
 * @param exitCode Exit code to exit with
 */
export function exit(exitCode: number) {
  process.exit(exitCode);
}
