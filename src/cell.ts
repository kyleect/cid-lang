import { CIDLangRuntimeError } from "./errors";
import {
  EmptyListExpression,
  Expression,
  ListExpression,
  isExpression,
} from "./expression";

/**
 * A cons cell
 *
 * The building block for lists
 */
export class Cell {
  private constructor(
    /**
     * First value of the cell
     */
    public readonly car: Expression,
    /**
     * Rest value of the cell
     */
    public readonly cdr: Expression
  ) {}

  /**
   * Create a pair from first and last values
   * @param car First value of cell
   * @param cdr Last value of cell
   * @returns Pair of first and last value
   */
  static of(car: unknown, cdr: unknown): Cell {
    if (!isExpression(car)) {
      throw new CIDLangRuntimeError(`Illegal car expression: ${car}`);
    }

    if (!isExpression(cdr)) {
      throw new CIDLangRuntimeError(`Illegal cdr expression: ${cdr}`);
    }

    return new Cell(car, cdr);
  }

  /**
   * Create a proper list from values
   * @param values Values for list
   * @returns Proper list
   */
  static list(...values: unknown[]): ListExpression {
    if (values.length === 0) {
      return EmptyListExpression;
    }

    const nonExpressions: unknown[] = values.filter(
      (value) => !isExpression(value)
    );

    if (nonExpressions.length > 0) {
      throw new CIDLangRuntimeError(
        `All values must be expressions: ${nonExpressions.join(", ")}`
      );
    }

    const valuesReversed = [...values].reverse();

    let cell: Cell;

    if (values.length === 0) {
      return EmptyListExpression;
    }

    if (values.length === 1) {
      return Cell.of(values[0], EmptyListExpression);
    }

    // eslint-disable-next-line no-constant-condition
    while (valuesReversed.length > 0) {
      const isFirst = values.length === valuesReversed.length;
      const car = valuesReversed.shift();
      cell = Cell.of(car, isFirst ? EmptyListExpression : cell);
    }

    return cell;
  }

  /**
   * Alias to cell's car value
   */
  public get first(): unknown {
    return this.car;
  }

  /**
   * Alias to cell's cdr value
   */
  public get rest(): unknown {
    return this.cdr;
  }

  /**
   * Yield cell as a list
   */
  *[Symbol.iterator]() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let value: unknown = this;

    while (value instanceof Cell) {
      yield value.car;
      value = value.cdr;
    }

    if (value !== EmptyListExpression) {
      yield value;
    }
  }

  /**
   * Get length as a list
   */
  get length(): number {
    let listLength = 0;
    for (const _ of this) listLength++;
    return listLength;
  }
}
