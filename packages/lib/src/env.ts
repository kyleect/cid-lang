import {
  car,
  cdr,
  cons,
  divide,
  isEqual,
  greaterThan,
  lessThan,
  multiply,
  sub,
  sum,
  display,
  exit,
  stringAppend,
  greaterThanOrEqual,
  lessThanOrEqual,
  stringJoin,
  isEquivalent,
  isEq,
} from "./builtins";
import { Cell } from "./cell";
import {
  isBooleanExpression,
  isListExpression,
  isNumericExpression,
  isPairExpression,
  isStringExpression,
  isSymbolExpression,
} from "./expression";

export class Environment {
  constructor(
    private values: Map<string, unknown> = new Map(),
    private enclosing?: Environment
  ) {}

  // Sets the variable value in the
  // environment where it was defined
  set(name: string, value: unknown) {
    if (this.values.has(name) || !this.enclosing) {
      this.values.set(name, value);
    } else if (this.enclosing) {
      this.enclosing.set(name, value);
    } else {
      throw new SyntaxError(`Unknown identifier: ${name}`);
    }
  }

  // Looks up the variable in the environment
  // as well as its enclosing environments
  get(name: string): unknown {
    if (this.values.has(name)) {
      return this.values.get(name);
    } else if (this.enclosing) {
      return this.enclosing.get(name);
    }
  }

  has(name: string): boolean {
    return this.values.has(name) || (this.enclosing?.has(name) ?? false);
  }

  static Default(): Environment {
    const env = new Environment(new Map());

    env.set("+", sum);
    env.set("-", sub);
    env.set("*", multiply);
    env.set("/", divide);

    env.set(">", greaterThan);
    env.set("<", lessThan);
    env.set(">=", greaterThanOrEqual);
    env.set("<=", lessThanOrEqual);

    env.set("list", Cell.list);
    env.set("car", car);
    env.set("cdr", cdr);
    env.set("cons", cons);

    env.set("eq?", isEq);
    env.set("eqv?", isEquivalent);
    env.set("equal?", isEqual);

    env.set("boolean?", isBooleanExpression);
    env.set("number?", isNumericExpression);
    env.set("string?", isStringExpression);
    env.set("symbol?", isSymbolExpression);
    env.set("pair?", isPairExpression);
    env.set("list?", isListExpression);

    env.set("string-append", stringAppend);
    env.set("string-join", stringJoin);

    env.set("display", display);
    env.set("exit", exit);

    return env;
  }
}
