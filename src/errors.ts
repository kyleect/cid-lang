/**
 * Base error for all cid errors
 */
export class CIDLangError extends Error {
  /**
   * Check if value is a CID error
   * @param value Value to check
   * @returns If value is a CID error
   */
  public static isError(value: unknown): value is CIDLangError {
    return value instanceof CIDLangError;
  }

  /**
   * Check if value is a CID syntax error
   * @param value Value to check
   * @returns If value is a CID syntax error
   */
  public static isSyntaxError(value: unknown): value is CIDLangSyntaxError {
    return value instanceof CIDLangSyntaxError;
  }

  /**
   * Check if value is a CID runtime error
   * @param value Value to check
   * @returns If value is a CID runtime error
   */
  public static isRuntimeError(value: unknown): value is CIDLangRuntimeError {
    return value instanceof CIDLangRuntimeError;
  }

  /**
   * Check if value is a CID exit error
   * @param value Value to check
   * @returns If value is a CID exit error
   */
  public static isExitError(value: unknown): value is CIDLangExitError {
    return value instanceof CIDLangExitError;
  }
}

/**
 * An error occurring during tokenization and parsing
 */
export class CIDLangSyntaxError extends CIDLangError {
  constructor(
    public lineNumber: number,
    public charNumber: number,
    message: string
  ) {
    super(`A syntax error occurred (${lineNumber}, ${charNumber}): ${message}`);
  }
}

/**
 * An error occurring during the runtime interpretation
 */
export class CIDLangRuntimeError extends CIDLangError {}

/**
 * An error occuring when constructing a list that doesn't
 * end with an empty list
 */
export class CIDImproperListError extends CIDLangRuntimeError {
  constructor(public readonly tail: unknown) {
    super();
  }
}

/**
 * An error thrown by the built in function `exit`
 *
 * This allows the cid language to exit the process with exit code
 */
export class CIDLangExitError extends CIDLangRuntimeError {
  constructor(public exitCode: number) {
    super(`An exit code of ${exitCode} was thrown`);
  }
}
