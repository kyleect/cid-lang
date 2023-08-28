export class SchemeTSError extends Error {}

export class SchemeTSSyntaxError extends SchemeTSError {
  constructor(
    public fileName: string,
    public lineNumber: number,
    public charNumber: number
  ) {
    super(
      `A syntax error occured in file ${fileName} on line ${lineNumber} at ${charNumber}`
    );
  }
}

export class SchemeTSExitError extends SchemeTSError {
  constructor(public exitCode: number) {
    super(`An exit code of ${exitCode} was thrown`);
  }
}
