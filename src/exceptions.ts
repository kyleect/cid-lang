export class SchemeTSError extends Error {}

export class SchemeTSExitError extends SchemeTSError {
  constructor(public exitCode: number) {
    super(`An exit code of ${exitCode} was thrown`);
  }
}
