import { Environment } from "./env";
import { Expr, LambdaExpr } from "./parser";
import assert from "assert";

export class Interpreter {
  static NULL_VALUE = [];

  private env: Environment;

  constructor() {
    const env = new Environment(
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
          "list?": ([arg]) =>
            Array.isArray(arg) ||
            (Expr.IsLiteral(arg) && Array.isArray(arg.value)),
          "number?": ([arg]) => Number.isInteger(arg),
          "string?": ([arg]) => typeof arg === "string",
          "procedure?": ([arg]) => arg instanceof Function,
          car: ([arg]) => arg[0],
          cdr: ([arg]) =>
            arg.length > 1 ? arg.slice(1) : Interpreter.NULL_VALUE,
          cons: ([a, b]) => [a, ...b],
          display: ([arg]) => console.log(arg),
          assert: ([a, b]) => assert(a, b),
        })
      )
    );

    env.set("eval", ([arg]) => {
      if (Expr.IsExpr(arg)) {
        return this.interpret(arg, this.env);
      }

      return arg;
    });

    this.env = env;
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

    return Expr.IsExpr(result) ? result.toString() : result;
  }

  /**
   * Interpret an expression in to a value
   * @param expr Expression to interpret
   * @param env Environment to use for interpretation
   * @returns Interpreted value
   */
  interpret(expr: Expr, env: Environment): unknown {
    /**
     * This is disabled for tail call optimization
     */
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Expr.isQuote(expr)) {
        if (Expr.IsLiteral(expr.value)) {
          if (Array.isArray(expr.value.value)) {
            return expr.value.value.length === 0
              ? Interpreter.NULL_VALUE
              : expr.value;
          }
        }

        if (Expr.isQuote(expr.value)) {
          return expr;
        }

        return expr.value;
      }

      if (Expr.IsLiteral(expr)) {
        if (Array.isArray(expr.value) && expr.value.length === 0) {
          return Interpreter.NULL_VALUE;
        }
        return expr.value;
      }

      if (Expr.IsSymbol(expr)) {
        const v = env.get(expr.token.getLexeme());

        if (Expr.isQuote(v)) {
          expr = v.value;
          continue;
        }

        return v;
      }

      if (Expr.IsIf(expr)) {
        const test = this.interpret(expr.test, env);
        expr = test ? expr.consequent : expr.alternative;

        continue;
      }

      if (Expr.IsCall(expr)) {
        const callee = this.interpret(expr.callee, env);
        const args: unknown[] = expr.args.map((arg) =>
          this.interpret(arg, env)
        );

        if (callee instanceof Procedure) {
          const lambdaParamValuePairs = new Map(
            callee.declaration.params.map((token, argIdx) => [
              token.getLexeme(),
              args[argIdx],
            ])
          );

          const callEnv = new Environment(
            lambdaParamValuePairs,
            callee.closure
          );

          if (callee.declaration.body.length === 0) {
            return undefined;
          }

          for (const exprInBody of callee.declaration.body.slice(0, -1)) {
            this.interpret(exprInBody, callEnv);
          }

          expr = callee.declaration.body[callee.declaration.body.length - 1];
          env = callEnv;

          continue;
        }

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

        if (expr.body.length === 0) {
          return undefined;
        }

        for (const exprInBody of expr.body.slice(0, -1)) {
          this.interpret(exprInBody, letEnv);
        }

        expr = expr.body[expr.body.length - 1];
        env = letEnv;
        continue;
      }

      if (Expr.isLambda(expr)) {
        return new Procedure(expr, env);
      }

      throw new SyntaxError(`Invalid expression:\n${expr}`);
    }
  }
}

class Procedure {
  constructor(public declaration: LambdaExpr, public closure: Environment) {}
}
