import { Environment } from "./env";
import { ListExpression } from "./expression";
import { Sym } from "./symbol";

export class Procedure {
  constructor(
    public params: ListExpression,
    public body: ListExpression,
    public closure: Environment
  ) {}

  toString() {
    return "#prodedure";
  }
}
