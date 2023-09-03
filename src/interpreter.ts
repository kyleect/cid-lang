import { Environment } from "./env";
import { SchemeTSError } from "./exceptions";
import { Expression, isAtomicExpression, isListExpression } from "./expression";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

export class Interpreter {
  constructor(public env: Environment = Environment.Default()) {}

  public interpretProgram(program: Expression): Expression {
    if (isListExpression(program)) {
      let result: Expression;

      for (const expression of program) {
        result = this.interpret(expression);
      }

      return result;
    }

    return this.interpret(program);
  }

  public interpret(
    expression: Expression,
    env: Environment = this.env
  ): Expression {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (isAtomicExpression(expression)) {
        if (expression instanceof Sym) {
          if (Sym.isKeyword(expression)) {
            throw new SchemeTSError(
              `Illegal reference to keyword: ${expression.name}`
            );
          }

          const value = this.env.get(expression.name) as Expression;

          if (typeof value === "undefined") {
            throw new SchemeTSError(`Undefined symbol: ${expression.name}`);
          }

          return value;
        }

        return expression;
      }

      if (isListExpression(expression)) {
        const [op, ...args] = expression;

        if (op instanceof Sym) {
          // Keywords
          if (op === Sym.Quote) {
            return args[0];
          }

          if (op === Sym.Define) {
            const [symbol, expr] = args;

            this.env.set((symbol as Sym).name, this.interpret(expr, env));
            return;
          }

          if (op === Sym.Set) {
            const [symbol, expr] = args;

            if (this.env.get((symbol as Sym).name)) {
              this.env.set((symbol as Sym).name, this.interpret(expr, env));
              return;
            }

            throw new SchemeTSError(
              "Unable to call set! on undefined symbol: x"
            );
          }

          if (op === Sym.Lambda) {
            const [params, ...body] = args;

            return new Procedure(
              params as unknown as Sym[],
              body,
              this.env
            ) as unknown as Expression;
          }

          if (op === Sym.If) {
            const [test, conseq, alt] = args;
            const result = this.interpret(test, env);

            expression = result ? conseq : alt;
            continue;
          }

          // Built In Functions Or Procedures

          const exps = expression.map((expr) => this.interpret(expr));

          const proc = exps.shift();

          if (typeof proc === "function") {
            return proc(...exps);
          }

          if (proc instanceof Procedure) {
            expression = proc.body;

            let i = 0;

            const entries: [string, Expression | Procedure][] = [];

            for (const _ of exps) {
              entries.push([proc.params[i].name, exps[i]]);
              i++;
            }

            this.env = new Environment(new Map(entries), env);

            continue;
          }
        }

        // Handle all remaining list expressions
        return expression.map((e) => this.interpret(e));
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
