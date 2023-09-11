import { Cell } from "./cell";
import { Environment } from "./env";
import { CIDLangRuntimeError } from "./errors";
import {
  Expression,
  ListExpression,
  NullExpression,
  Program,
  assertIsExpression,
  assertIsListExpression,
  isAtomicExpression,
  isExpression,
  isListExpression,
  isPairExpression,
  isProgram,
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
  public interpretProgram(program: Program): Expression {
    let result: Expression;

    if (!isProgram(program)) {
      throw new CIDLangRuntimeError(
        `Illegal program. Program must be a sequence of expressions: ${program}`
      );
    }

    for (const expression of program) {
      result = this.#interpret(expression);
    }

    return result;
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

      // Handle non atomic expressions as list expressions: PairExpression | NullExpression
      if (isListExpression(expression)) {
        // Handle pair expressions (proper lists)
        if (isPairExpression(expression)) {
          const { car, cdr } = expression;

          // Handle call expressions: [Sym, ...Expression]
          if (Sym.is(car)) {
            const op = car;
            const args = cdr;

            assertIsListExpression(args);

            // Special Expression Forms

            if (op === Sym.Quote) {
              if (!isPairExpression(args)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

              return args.car;
            }

            if (op === Sym.Define) {
              const [symbol, expr] = args;

              if (!Sym.is(symbol)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

              const name = symbol.name;

              assertIsExpression(expr);

              const value = this.#interpret(expr, env);

              env.set(name, value);
              return;
            }

            if (op === Sym.Set) {
              const [symbol, expr] = args;

              if (!Sym.is(symbol)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

              const name = symbol.name;

              if (!isExpression(expr)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

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
              const [params, body] = args;

              if (!isListExpression(params)) {
                throw new CIDLangRuntimeError(
                  `Lambda params must be a list expression: ${params}`
                ); // TODO:
              }

              if (!isExpression(body)) {
                throw new CIDLangRuntimeError(
                  `Lambda body must be an expression: ${params}`
                ); // TODO:
              }

              return new Procedure(
                params,
                body,
                env
              ) as unknown as ListExpression;
            }

            if (op === Sym.If) {
              const [test, conseq, alt] = args;

              if (!isExpression(test)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

              if (!isExpression(conseq)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

              if (!isExpression(alt)) {
                throw new CIDLangRuntimeError(""); // TODO:
              }

              const result = this.#interpret(test, env);

              expression = result ? conseq : alt;
              continue;
            }

            // Built In Functions

            const proc = this.#interpret(op, env);
            if (typeof proc === "function") {
              const fn = proc;
              const callFnArgs = Array.from(args);

              if (callFnArgs.length < fn.length) {
                throw new CIDLangRuntimeError(
                  `Function '${op}' expects ${
                    fn.length
                  } arguments but received ${callFnArgs.length}${
                    callFnArgs.length > 0 ? `: ${callFnArgs.join(", ")}` : ""
                  }`
                );
              }

              const interpretedArgs = callFnArgs.map((arg) =>
                this.#interpret(arg as Expression, env)
              );

              return proc(...interpretedArgs);
            }

            // Handle procedure calls
            if (proc instanceof Procedure) {
              if (!isListExpression(cdr)) {
                throw new CIDLangRuntimeError(
                  `Procedure params must be a list expression: ${cdr}`
                ); // TODO:
              }

              const callProcArgs = Array.from(cdr) as Expression[];
              const procParams = Array.from(proc.params);

              // Validate the number of call args matches the number of proc params
              if (callProcArgs.length !== procParams.length) {
                throw new CIDLangRuntimeError(
                  `Procedure expected ${procParams.length} but got ${callProcArgs.length}`
                );
              }

              // Validate procedure params are all symbols
              const nonSymProcParams = procParams.filter(
                (procParam) => !Sym.is(procParam)
              );
              if (nonSymProcParams.length > 0) {
                throw new CIDLangRuntimeError(
                  `All params in a lambda expression must be symbols: ${nonSymProcParams.join(
                    ", "
                  )}`
                );
              }

              // Map call args to proc params by index position
              const procArgValuePairs: [string, Expression][] = (
                procParams as Sym[]
              ).map((procParam, paramIndex) => [
                procParam.name,
                this.#interpret(callProcArgs[paramIndex], env),
              ]);

              // Create environment for the procedure to run in
              // Closure + Proc Param Args
              const procEnv = new Environment(
                new Map(procArgValuePairs),
                proc.closure
              );

              return this.#interpret(proc.body, procEnv);
            }
          }

          // Handle all remaining pair expressions
          const remainingPairExpressions = Cell.list(
            ...Array.from(expression).map((e) =>
              this.#interpret(e as Expression, env)
            )
          );

          if (remainingPairExpressions[0] instanceof Procedure) {
            expression = remainingPairExpressions;
            continue;
          } else {
            return remainingPairExpressions;
          }
        }

        // The only list expression that isn't a pair expression is an empty list
        if (!Object.is(expression, NullExpression)) {
          throw new CIDLangRuntimeError(
            `Invalid list expression: ${JSON.stringify(expression)}`
          );
        }

        // Return common empty list reference
        return NullExpression;
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
