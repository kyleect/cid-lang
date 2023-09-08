import { Environment } from "./env";
import { SchemeTSError } from "./exceptions";
import {
  EmptyListExpression,
  Expression,
  ListExpression,
  isAtomicExpression,
  isListExpression,
} from "./expression";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

export class Interpreter {
  constructor(public env: Environment = Environment.Default()) {}

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

  #interpret(expression: Expression, env: Environment = this.env): Expression {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (isAtomicExpression(expression)) {
        if (Sym.is(expression)) {
          if (Sym.isKeyword(expression)) {
            throw new SchemeTSError(
              `Illegal reference to keyword: ${expression.name}`
            );
          }

          const value = env.get(expression.name) as Expression;

          if (typeof value === "undefined") {
            throw new SchemeTSError(`Undefined symbol: ${expression.name}`);
          }

          return value;
        }

        return expression;
      }

      if (isListExpression(expression)) {
        const [op, ...args] = expression;

        if (expression === EmptyListExpression) {
          return expression;
        }

        if (Sym.is(op)) {
          // Keywords

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

            throw new SchemeTSError(
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

          // Built In Functions Or Procedures
          const proc = this.#interpret(op, env);

          if (typeof proc === "function") {
            const interpretedArgs = args.map((arg) =>
              this.#interpret(arg, env)
            );
            return proc(...interpretedArgs);
          }
        }

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

      // Value passed as expression is not a valid expression

      const expressionStringValue =
        typeof expression === "symbol" ? String(expression) : expression;

      throw new SchemeTSError(
        `Illegal expression. Value is not atomic or list expression: ${expressionStringValue}`
      );
    }
  }
}
