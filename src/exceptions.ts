export class CIDLangError extends Error {}

export class CIDLangSyntaxError extends CIDLangError {
  constructor(
    public lineNumber: number,
    public charNumber: number,
    message: string
  ) {
    super(`A syntax error occurred (${lineNumber}, ${charNumber}): ${message}`);
  }
}

export class CIDLangRuntimeError extends CIDLangError {}

export class CIDLangExitError extends CIDLangRuntimeError {
  constructor(public exitCode: number) {
    super(`An exit code of ${exitCode} was thrown`);
  }
}
