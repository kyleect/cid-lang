export class SchemeTSError extends Error {}

export class SchemeTSSyntaxError extends SchemeTSError {
  constructor(
    public lineNumber: number,
    public charNumber: number,
    message: string
  ) {
    super(`A syntax error occurred (${lineNumber}, ${charNumber}): ${message}`);
  }
}

export class SchemeTSExitError extends SchemeTSError {
  constructor(public exitCode: number) {
    super(`An exit code of ${exitCode} was thrown`);
  }
}
