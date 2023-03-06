import { Expr, LetBindingNode, Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Parser", () => {
  it("should return literal expression for bracket pair", () => {
    expectInputReturns("()", [Expr.Literal([])]);
  });

  it("should return expressions for nested calls", () => {
    expectInputReturns("(+ (+ 1 2) (+ 3 4))", [
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
    expectInputReturns("(if (> 2 1) 3 4)", [
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
    expect(() => parseInput("(()")).toThrowError(
      new SyntaxError(`Unexpected token: ${Token.Eof().getTokenType()}`)
    );
  });

  it("should throw for unmatched right bracket", () => {
    expect(() => parseInput(")")).toThrowError(
      new SyntaxError(
        `Unexpected token: ${Token.RightBracket().getTokenType()}`
      )
    );
  });

  it("should return expressions for a let binding", () => {
    expectInputReturns("(let ((x 2) (y 4)) (display x) (display y))", [
      Expr.Let(
        [
          new LetBindingNode(Token.Symbol("x"), Expr.Literal(2)),
          new LetBindingNode(Token.Symbol("y"), Expr.Literal(4)),
        ],
        [
          Expr.Call(Expr.Symbol(Token.Symbol("display")), [
            Expr.Symbol(Token.Symbol("x")),
          ]),
          Expr.Call(Expr.Symbol(Token.Symbol("display")), [
            Expr.Symbol(Token.Symbol("y")),
          ]),
        ]
      ),
    ]);
  });
});

describe("Expr", () => {
  describe("CallExpr", () => {
    it("should stringify", () => {
      expect(Expr.Call(Token.Symbol("expected"), []).toString()).toBe(
        `<CallExpr callee=${Token.Symbol("expected")}; args=[]>`
      );
    });
  });

  describe("SymbolExpr", () => {
    it("should stringify", () => {
      expect(Expr.Symbol(Token.Symbol("expected")).toString()).toBe(
        `<SymbolExpr token=${Token.Symbol("expected")}>`
      );
    });
  });

  describe("LiteralExpr", () => {
    it("should stringify", () => {
      expect(Expr.Literal(123).toString()).toBe("<LiteralExpr value=123>");
    });
  });

  describe("DefineExpr", () => {
    it("should stringify", () => {
      expect(Expr.Define(Token.Symbol("expected"), 123).toString()).toBe(
        `<DefineExpr token=${Token.Symbol("expected")}; value=123>`
      );
    });
  });

  describe("SetExpr", () => {
    it("should stringify", () => {
      expect(Expr.Set(Token.Symbol("expected"), 123).toString()).toBe(
        `<SetExpr token=${Token.Symbol("expected")}; value=123>`
      );
    });
  });

  describe("LetExpr", () => {
    it("should stringify", () => {
      expect(
        Expr.Let(
          [new LetBindingNode(Token.Symbol("expected"), Expr.Literal(123))],
          [
            Expr.Symbol(Token.Symbol("expected")),
            Expr.Symbol(Token.Symbol("expected")),
          ]
        ).toString()
      ).toBe(
        `<LetExpr bindings=[<LetBindingNode name=<Token type='Symbol'; lexeme='expected'; literal=null>; value=<LiteralExpr value=123>>]; body=[<SymbolExpr token=<Token type='Symbol'; lexeme='expected'; literal=null>>,<SymbolExpr token=<Token type='Symbol'; lexeme='expected'; literal=null>>]>`
      );
    });
  });

  describe("LambdaExpr", () => {
    it("should stringify", () => {
      expect(
        Expr.Lambda(
          [Token.Symbol("expected")],
          [
            Expr.Symbol(Token.Symbol("expected")),
            Expr.Symbol(Token.Symbol("expected")),
          ]
        ).toString()
      ).toBe(
        `<Lambda params=[<Token type='Symbol'; lexeme='expected'; literal=null>]; body=[<SymbolExpr token=<Token type='Symbol'; lexeme='expected'; literal=null>>,<SymbolExpr token=<Token type='Symbol'; lexeme='expected'; literal=null>>]>`
      );
    });
  });
});

function parseInput(input: string): Expr[] {
  const scanner = new Scanner(input);
  const tokens = scanner.scan();
  const parser = new Parser(tokens);

  const expressions = parser.parse();

  return expressions;
}

function expectInputReturns(input: string, expectedOutput: Expr[]) {
  expect(parseInput(input)).toStrictEqual(expectedOutput);
}
