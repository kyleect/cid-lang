import { Expr } from "./parser";

export class Interpreter {
  static NULL_VALUE = [];

  private env: Map<string, unknown>;

  constructor() {
    this.env = new Map(
      Object.entries({
        "*": ([a, b]) => a * b,
        "+": ([a, b]) => {
          return a + b;
        },
        "/": ([a, b]) => a / b,
        "-": ([a, b]) => a - b,
        "=": ([a, b]) => a === b,
        remainder: ([a, b]) => a % b,
        ">=": ([a, b]) => a >= b,
        "<=": ([a, b]) => a <= b,
        not: ([arg]) => !arg,
        "string-length": ([str]) => str.length,
        "string-append": ([a, b]) => a + b,
        list: (args) => args,
        "null?": ([arg]) => arg === Interpreter.NULL_VALUE,
        "list?": ([arg]) => Array.isArray(arg),
        "number?": ([arg]) => Number.isInteger(arg),
        "procedure?": ([arg]) => arg instanceof Function,
        car: ([arg]) => arg[0],
        cdr: ([arg]) =>
          arg.length > 1 ? arg.slice(1) : Interpreter.NULL_VALUE,
        cons: ([a, b]) => [a, ...b],
        display: ([arg]) => console.log(arg),
      })
    );
  }

  interpretAll(expressions: Expr[]): unknown {
    let result: unknown;

    for (const expr of expressions) {
      result = this.interpret(expr, this.env);
    }

    return result;
  }

  interpret(expr: Expr, env?: typeof this.env): unknown {
    if (Expr.IsLiteral(expr)) {
      return expr.value;
    }

    if (Expr.IsSymbol(expr)) {
      if (env.has(expr.token.getLexeme())) {
        return env.get(expr.token.getLexeme());
      }
      throw new SyntaxError(`Unknown identifier: ${expr.token.getLexeme()}`);
    }

    if (Expr.IsIf(expr)) {
      const test = this.interpret(expr.test, env);
      if (test !== false) {
        return this.interpret(expr.consequent, env);
      }
      return this.interpret(expr.alternative, env);
    }

    if (Expr.IsCall(expr)) {
      const callee = this.interpret(expr.callee, env);
      const args = expr.args.map((arg) => this.interpret(arg, env));
      if (callee instanceof Function) {
        return callee(args);
      }
      throw new Error(`Cannot call ${callee}`);
    }

    if (Expr.isDefine(expr)) {
      const value = this.interpret(expr.value, env);
      env.set(expr.token.getLexeme(), value);
      return;
    }

    if (Expr.isSet(expr)) {
      const value = this.interpret(expr.value, env);
      if (env.has(expr.token.getLexeme())) {
        env.set(expr.token.getLexeme(), value);
        return;
      }
      throw new Error(`Unknown identifier: ${expr.token.getLexeme()}`);
    }

    debugger;

    throw new Error(`Invalid expression: ${expr}`);
  }
}
