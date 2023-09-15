import { Cell } from "./cell";
import { CIDLangError, CIDLangRuntimeError } from "./errors";
import {
  isExpression,
  isListExpression,
  isNotAnExpression,
  isNumericExpression,
  isPairExpression,
  isStringExpression,
} from "./expression";
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  if (!isNumericExpression(a) || !isNumericExpression(b)) {
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
  return stringJoin(Cell.list(...values), "");
}

/**
 * Join values in to a string using a joiner string
 * @param values Values to append as a string
 * @param joiner String to use as a joiner
 * @returns String of joined values
 */
export function stringJoin(values: unknown, joiner: unknown) {
  if (!isListExpression(values)) {
    throw new CIDLangRuntimeError("Values arugment must be a list expression");
  }

  const valuesArr = Array.from(values);

  const nonExpressionValues = valuesArr.filter(isNotAnExpression);

  if (nonExpressionValues.length > 0) {
    throw new CIDLangRuntimeError(
      `All arguments must be an expression: ${nonExpressionValues.join(", ")}`
    );
  }

  if (!isStringExpression(joiner)) {
    throw new CIDLangRuntimeError(
      `Joiner must be a string expression: ${joiner}`
    );
  }

  return valuesArr.join(joiner);
}

// Compare

/**
 * Check if two values are the same reference
 *
 * @param a Value to check
 * @param b Value to compare
 * @returns If the two values are the same reference in memory
 */
export function isEq(a: unknown, b: unknown) {
  const nonExpressionValues = [a, b].filter(isNotAnExpression);

  if (nonExpressionValues.length > 0) {
    throw new CIDLangRuntimeError(
      `All arguments must be an expression: ${nonExpressionValues.join(", ")}`
    );
  }

  if (Sym.is(a) && Sym.is(b)) {
    return a.name === b.name;
  }

  return Object.is(a, b);
}

/**
 * Check if two values are the same reference
 *
 * @param a Value to check
 * @param b Value to compare
 * @returns If the two values are the same reference in memory
 */
export function isEquivalent(a: unknown, b: unknown): boolean {
  return isEq(a, b);
}

/**
 * Check if two values are the same reference
 *
 * Will check lists recursively
 *
 * @param a Value to check
 * @param b Value to compare
 * @returns If the two values (recursively for lists) are the same reference in memory
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (isListExpression(a) && isListExpression(b)) {
    if (a.length !== b.length) {
      return false;
    }

    const aArr = Array.from(a);
    const bArr = Array.from(b);

    for (let i = 0; i < aArr.length; i++) {
      const expressionA = aArr[i];
      const expressionB = bArr[i];

      if (!isEqual(expressionA, expressionB)) {
        return false;
      }
    }

    return true;
  }

  return isEquivalent(a, b);
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
