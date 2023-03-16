import { Expr, LetBindingNode, Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Parser", () => {
  it("should return literal expression for bracket pair", () => {
    expectInputReturns("()", [Expr.Literal([])]);
  });

  it("should return literal expression for bracket pair", () => {
    expectInputReturns("(quote ())", [Expr.Quote(Expr.Literal([]))]);
  });

  it("should return a call expression when short quoted", () => {
    expectInputReturns(
      `
    (define q '(+ 1 1))
    (eval q)`,
      [
        Expr.Define(
          Token.Symbol("q"),
          Expr.Quote(
            Expr.Call(Expr.Symbol(Token.Symbol("+")), [
              Expr.Literal(1),
              Expr.Literal(1),
            ])
          )
        ),
        Expr.Call(Expr.Symbol(Token.Symbol("eval")), [
          Expr.Symbol(Token.Symbol("q")),
        ]),
      ]
    );
  });

  it("should return quoted expression", () => {
    expectInputReturns("(quote (+ 1 1))", [
      Expr.Quote(
        Expr.Call(Expr.Symbol(Token.Symbol("+")), [
          Expr.Literal(1),
          Expr.Literal(1),
        ])
      ),
    ]);
  });

  it("should return nested quoted expression", () => {
    expectInputReturns("(quote (quote (+ 1 1)))", [
      Expr.Quote(
        Expr.Quote(
          Expr.Call(Expr.Symbol(Token.Symbol("+")), [
            Expr.Literal(1),
            Expr.Literal(1),
          ])
        )
      ),
    ]);
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
      expect(
        Expr.Call(Expr.Symbol(Token.Symbol("expected")), []).toString()
      ).toBe(`(expected)`);
    });

    it("should stringify when args present", () => {
      expect(
        Expr.Call(Expr.Symbol(Token.Symbol("expectedFn")), [
          Expr.Literal(123),
          Expr.Symbol(Token.Symbol("expectedArg")),
        ]).toString()
      ).toBe(`(expectedFn 123 expectedArg)`);
    });
  });

  describe("SymbolExpr", () => {
    it("should stringify", () => {
      expect(Expr.Symbol(Token.Symbol("expected")).toString()).toBe(`expected`);
    });
  });

  describe("LiteralExpr", () => {
    it("should stringify", () => {
      expect(Expr.Literal(123).toString()).toBe("123");
    });
  });

  describe("DefineExpr", () => {
    it("should stringify", () => {
      expect(Expr.Define(Token.Symbol("expected"), 123).toString()).toBe(
        `(define expected 123)`
      );
    });
  });

  describe("SetExpr", () => {
    it("should stringify", () => {
      expect(Expr.Set(Token.Symbol("expected"), 123).toString()).toBe(
        `(set! expected 123)`
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
      ).toBe(`(let ((expected 123)) expected expected)`);
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
      ).toBe(`(lambda (expected) expected expected)`);
    });
  });

  describe("QuoteExpr", () => {
    it("should stringify", () => {
      expect(parseInput("(quote (+ 1 1))").toString()).toBe("(+ 1 1)");
    });

    it("should stringify using ' quote", () => {
      expect(parseInput("'(+ 1 1)").toString()).toBe("(+ 1 1)");
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
