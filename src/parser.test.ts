import { Expr, Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Parser", () => {
  it("should return literal expression for bracket pair", () => {
    const scanner = new Scanner("()");
    const tokens = scanner.scan();
    const parser = new Parser(tokens);

    expect(parser.parse()).toStrictEqual([Expr.Literal([])]);
  });

  it("should return expressions for nested calls", () => {
    const scanner = new Scanner("(+ (+ 1 2) (+ 3 4))");
    const tokens = scanner.scan();
    const parser = new Parser(tokens);

    expect(parser.parse()).toStrictEqual([
      Expr.Call(Expr.Symbol(Token.Symbol("+")), [
        Expr.Call(Expr.Symbol(Token.Symbol("+")), [
          Expr.Literal(1),
          Expr.Literal(2),
        ]),
        Expr.Call(Expr.Symbol(Token.Symbol("+")), [
          Expr.Literal(3),
          Expr.Literal(4),
        ]),
      ]),
    ]);
  });

  it("should return expressions for if", () => {
    const scanner = new Scanner("(if (> 2 1) 3 4)");
    const tokens = scanner.scan();
    const parser = new Parser(tokens);

    expect(parser.parse()).toStrictEqual([
      Expr.If(
        Expr.Call(Expr.Symbol(Token.Symbol(">")), [
          Expr.Literal(2),
          Expr.Literal(1),
        ]),
        Expr.Literal(3),
        Expr.Literal(4)
      ),
    ]);
  });

  it("should throw for unmatched bracket", () => {
    const scanner = new Scanner("(()");
    const tokens = scanner.scan();
    const parser = new Parser(tokens);

    expect(() => parser.parse()).toThrowError(
      new SyntaxError(`Unexpected token: ${Token.Eof().getTokenType()}`)
    );
  });

  it("should throw for unmatched right bracket", () => {
    const scanner = new Scanner(")");
    const tokens = scanner.scan();
    const parser = new Parser(tokens);

    expect(() => parser.parse()).toThrowError(
      new SyntaxError(
        `Unexpected token: ${Token.RightBracket().getTokenType()}`
      )
    );
  });
});
