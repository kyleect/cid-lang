import { Environment } from "./env";
import { CIDLangRuntimeError } from "./errors";
import {
  EmptyListExpression,
  Expression,
  ListExpression,
  isAtomicExpression,
  isListExpression,
} from "./expression";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

/**
 * Interprets expressions of a program in to a resulting expression
 */
export class Interpreter {
  constructor(public env: Environment = Environment.Default()) {}

  /**
   * Interpret program (expression/expressions) and return result expression
   * @param {Expression} program Expression representing the program to interpret
   * @returns Result of program's last interpreted expression
   */
  public interpretProgram(program: Expression): Expression {
    if (isListExpression(program)) {
      let result: Expression;

      for (const expression of program) {
        result = this.#interpret(expression);
      }

      return result;
    }

    return this.#interpret(program);
  }

  /**
   * Interpret an individual expression
   * @param expression Expression to interpret
   * @param env Environment to use for interpretation
   * @returns Result of expression's interpretation
   */
  #interpret(expression: Expression, env: Environment = this.env): Expression {
    // This while loop is used for tail call optimization
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Handle atomic expressions first: Sym | number | string | boolean
      if (isAtomicExpression(expression)) {
        if (Sym.is(expression)) {
          if (Sym.isKeyword(expression)) {
            throw new CIDLangRuntimeError(
              `Illegal reference to keyword: ${expression.name}`
            );
          }

          const value = env.get(expression.name) as Expression;

          if (typeof value === "undefined") {
            throw new CIDLangRuntimeError(
              `Undefined symbol: ${expression.name}`
            );
          }

          return value;
        }

        return expression;
      }

      // Handle non atomic expressions as list expressions: (AtomicExpression | ListExpression)[]
      if (isListExpression(expression)) {
        const [op, ...args] = expression;

        // Empty lists should return reference to empty list constant
        if (expression === EmptyListExpression) {
          return EmptyListExpression;
        }

        // Handle call expressions: [Sym, ...Expression]
        if (Sym.is(op)) {
          // Special Expression Forms

          if (op === Sym.Quote) {
            return args[0];
          }

          if (op === Sym.Define) {
            const [symbol, expr] = args;

            const name = (symbol as Sym).name;
            const value = this.#interpret(expr, env);

            env.set(name, value);
            return;
          }

          if (op === Sym.Set) {
            const [symbol, expr] = args;

            const name = (symbol as Sym).name;

            if (env.has(name)) {
              const value = this.#interpret(expr, env);

              env.set(name, value);
              return;
            }

            throw new CIDLangRuntimeError(
              `Unable to call set! on undefined symbol: ${name}`
            );
          }

          if (op === Sym.Lambda) {
            const [params, ...body] = args;

            return new Procedure(
              params as unknown as Sym[],
              body,
              env
            ) as unknown as ListExpression;
          }

          if (op === Sym.If) {
            const [test, conseq, alt] = args;
            const result = this.#interpret(test, env);

            expression = result ? conseq : alt;
            continue;
          }

          // Built In Functions

          const proc = this.#interpret(op, env);
          if (typeof proc === "function") {
            if (args.length < proc.length) {
              throw new CIDLangRuntimeError(
                `Function '${op}' expects ${
                  proc.length
                } arguments but received ${args.length}${
                  args.length > 0 ? `: ${args.join(", ")}` : ""
                }`
              );
            }

            const interpretedArgs = args.map((arg) =>
              this.#interpret(arg, env)
            );

            return proc(...interpretedArgs);
          }
        }

        // Handle procedure calls
        if (op instanceof Procedure) {
          const procArgValuePairs: [string, Expression][] = op.params.map(
            (sym, i) => [sym.name, args?.[i]]
          );

          const procEnv = new Environment(
            new Map(procArgValuePairs),
            op.closure
          );

          if (op.body.length === 0) {
            return undefined;
          }

          if (op.body.length > 1) {
            for (const expr of op.body.slice(0, -1)) {
              this.#interpret(expr, procEnv);
            }
          }

          return this.#interpret(op.body.at(-1), procEnv);
        }

        // Handle all remaining list expressions
        const e = expression.map((e) => this.#interpret(e, env));
        if (e[0] instanceof Procedure) {
          expression = e;
          continue;
        } else {
          return e;
        }
      }

      // Handle invalid expressions
      const expressionStringValue =
        typeof expression === "symbol" ? String(expression) : expression;
      throw new CIDLangRuntimeError(
        `Illegal expression. Value is not atomic or list expression: ${expressionStringValue}`
      );
    }
  }
}
