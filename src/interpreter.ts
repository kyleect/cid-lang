import { Environment } from "./env";
import { Expr } from "./parser";

export class Interpreter {
  static NULL_VALUE = [];

  private env: Environment;

  constructor() {
    this.env = new Environment(
      new Map(
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
          "string?": ([arg]) => typeof arg === "string",
          "procedure?": ([arg]) => arg instanceof Function,
          car: ([arg]) => arg[0],
          cdr: ([arg]) =>
            arg.length > 1 ? arg.slice(1) : Interpreter.NULL_VALUE,
          cons: ([a, b]) => [a, ...b],
          display: ([arg]) => console.log(arg),
        })
      ),
      null
    );
  }

  /**
   * Set a variable in the environment
   * @param name Name of variable in environment
   * @param value Value to set
   */
  public envSet(name: string, value: unknown) {
    this.env.set(name, value);
  }

  /**
   * Gets variable value from environment or throws
   * @param name Name of variable in environment
   * @returns Variable value in environment
   */
  public envGet(name: string): unknown {
    return this.env.get(name);
  }

  /**
   * Returns if variable is defined in environment
   * @param name Name of variable in environment
   * @returns Boolean if variable is in environment
   */
  public envHas(name: string): boolean {
    return this.env.has(name);
  }

  interpretAll(expressions: Expr[]): unknown {
    let result: unknown;

    for (const expr of expressions) {
      result = this.interpret(expr, this.env);
    }

    return result;
  }

  interpret(expr: Expr, env: typeof this.env): unknown {
    if (Expr.IsLiteral(expr)) {
      return expr.value;
    }

    if (Expr.IsSymbol(expr)) {
      return env.get(expr.token.getLexeme());
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

      if (typeof callee === "function") {
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
      throw new SyntaxError(`Unknown identifier: ${expr.token.getLexeme()}`);
    }

    if (Expr.isLet(expr)) {
      const bindingEntries = expr.bindingsToMap();

      const interpretedBindings: [string, unknown][] = Array.from(
        bindingEntries
      ).map<[string, unknown]>((entry) => [
        entry[0] as string,
        this.interpret(entry[1], env),
      ]);

      const letEnv = new Environment(new Map(interpretedBindings), env);

      let result;

      for (const exprInBody of expr.body) {
        result = this.interpret(exprInBody, letEnv);
      }
      return result;
    }

    throw new SyntaxError(`Invalid expression:\n${expr}`);
  }
}
