import { Environment } from "./env";
import { Expression } from "./expression";
import { Sym } from "./symbol";

export class Procedure {
  constructor(
    public params: Sym[],
    public body: Expression[],
    public closure: Environment
  ) {}

  toString() {
    return "#prodedure";
  }
}
