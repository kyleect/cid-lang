import { CIDLangRuntimeError } from "./errors";
import {
  Expression,
  ListExpression,
  NullExpression,
  assertIsExpression,
  isNotAnExpression,
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
    assertIsExpression(car, `Illegal car expression: ${car}`);
    assertIsExpression(cdr, `Illegal cdr expression: ${cdr}`);

    return new Cell(car, cdr);
  }

  /**
   * Create a proper list from values
   * @param values Values for list
   * @returns Proper list
   */
  static list(...values: unknown[]): ListExpression {
    if (values.length === 0) {
      return NullExpression;
    }

    const nonExpressions = values.filter(isNotAnExpression);

    if (nonExpressions.length > 0) {
      throw new CIDLangRuntimeError(
        `All values must be expressions: ${nonExpressions.join(", ")}`
      );
    }

    const valuesReversed = [...values].reverse();

    let cell: ListExpression = NullExpression;

    if (values.length === 0) {
      return cell;
    }

    if (values.length === 1) {
      return Cell.of(values[0], NullExpression);
    }

    // eslint-disable-next-line no-constant-condition
    while (valuesReversed.length > 0) {
      const isFirst = values.length === valuesReversed.length;
      const car = valuesReversed.shift();
      cell = Cell.of(car, isFirst ? NullExpression : cell);
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
   * Iterate a cell as an array
   */
  *[Symbol.iterator]() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let value: unknown = this;

    while (value instanceof Cell) {
      yield value.car;
      value = value.cdr;
    }

    if (value !== NullExpression) {
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
