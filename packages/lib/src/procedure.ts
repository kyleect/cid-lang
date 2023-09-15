import { Environment } from "./env";
import { Expression, ListExpression } from "./expression";

export class Procedure {
  constructor(
    public params: ListExpression,
    public body: Expression,
    public closure: Environment
  ) {}

  toString() {
    return "#prodedure";
  }
}
