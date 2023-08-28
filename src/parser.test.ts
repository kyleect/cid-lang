import { Expr, LetBindingNode, Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Parser", () => {
  it("should return literal expression for bracket pair", () => {
    expectInputReturns("()", [Expr.Literal([])]);
  });

  it("should return literal expression for quoted bracket pair", () => {
    expectInputReturns("(quote ())", [Expr.Quote(Expr.Literal([]))]);
  });

  it("should return literal expression for short quoted bracket pair", () => {
    expectInputReturns("'()", [Expr.Quote(Expr.Literal([]))]);
  });

  it("should return a call expression when short quoted", () => {
    expectInputReturns(
      `
    (define q '(+ 1 1))
    (eval q)`,
      [
        Expr.Define(
          Token.Symbol("q", 1, 12),
          Expr.Quote(
            Expr.Call(Expr.Symbol(Token.Symbol("+", 1, 16)), [
              Expr.Literal(1),
              Expr.Literal(1),
            ])
          )
        ),
        Expr.Call(Expr.Symbol(Token.Symbol("eval", 2, 5)), [
          Expr.Symbol(Token.Symbol("q", 2, 10)),
        ]),
      ]
    );
  });

  it("should return quoted expression", () => {
    expectInputReturns("(quote (+ 1 1))", [
      Expr.Quote(
        Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 8)), [
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
          Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 15)), [
            Expr.Literal(1),
            Expr.Literal(1),
          ])
        )
      ),
    ]);
  });

  it("should return expressions for nested calls", () => {
    expectInputReturns("(+ (+ 1 2) (+ 3 4))", [
      Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 1)), [
        Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 4)), [
          Expr.Literal(1),
          Expr.Literal(2),
        ]),
        Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 12)), [
          Expr.Literal(3),
          Expr.Literal(4),
        ]),
      ]),
    ]);
  });

  it("should return expressions for if", () => {
    expectInputReturns("(if (> 2 1) 3 4)", [
      Expr.If(
        Expr.Call(Expr.Symbol(Token.Symbol(">", 0, 5)), [
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
      new SyntaxError(`Unexpected token: ${Token.Eof(1, 0).getTokenType()}`)
    );
  });

  it("should throw for unmatched right bracket", () => {
    expect(() => parseInput(")")).toThrowError(
      new SyntaxError(
        `Unexpected token: ${Token.RightBracket(0, 0).getTokenType()}`
      )
    );
  });

  it("should return expressions for a let binding", () => {
    expectInputReturns("(let ((x 2) (y 4)) (display x) (display y))", [
      Expr.Let(
        [
          new LetBindingNode(Token.Symbol("x", 0, 7), Expr.Literal(2)),
          new LetBindingNode(Token.Symbol("y", 0, 13), Expr.Literal(4)),
        ],
        [
          Expr.Call(Expr.Symbol(Token.Symbol("display", 0, 20)), [
            Expr.Symbol(Token.Symbol("x", 0, 28)),
          ]),
          Expr.Call(Expr.Symbol(Token.Symbol("display", 0, 32)), [
            Expr.Symbol(Token.Symbol("y", 0, 40)),
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
        Expr.Call(Expr.Symbol(Token.Symbol("expected", 0, 0)), []).toString()
      ).toBe(`(expected)`);
    });

    it("should stringify when args present", () => {
      expect(
        Expr.Call(Expr.Symbol(Token.Symbol("expectedFn", 0, 1)), [
          Expr.Literal(123),
          Expr.Symbol(Token.Symbol("expectedArg", 0, 16)),
        ]).toString()
      ).toBe(`(expectedFn 123 expectedArg)`);
    });
  });

  describe("SymbolExpr", () => {
    it("should stringify", () => {
      expect(Expr.Symbol(Token.Symbol("expected", 0, 0)).toString()).toBe(
        `expected`
      );
    });
  });

  describe("LiteralExpr", () => {
    it("should stringify", () => {
      expect(Expr.Literal(123).toString()).toBe("123");
    });
  });

  describe("DefineExpr", () => {
    it("should stringify", () => {
      expect(Expr.Define(Token.Symbol("expected", 0, 8), 123).toString()).toBe(
        `(define expected 123)`
      );
    });
  });

  describe("SetExpr", () => {
    it("should stringify", () => {
      expect(Expr.Set(Token.Symbol("expected", 0, 6), 123).toString()).toBe(
        `(set! expected 123)`
      );
    });
  });

  describe("LetExpr", () => {
    it("should stringify", () => {
      expect(
        Expr.Let(
          [
            new LetBindingNode(
              Token.Symbol("expected", 0, 7),
              Expr.Literal(123)
            ),
          ],
          [
            Expr.Symbol(Token.Symbol("expected", 0, 22)),
            Expr.Symbol(Token.Symbol("expected", 0, 31)),
          ]
        ).toString()
      ).toBe(`(let ((expected 123)) expected expected)`);
    });
  });

  describe("LambdaExpr", () => {
    it("should stringify", () => {
      expect(
        Expr.Lambda(
          [Token.Symbol("expected", 0, 9)],
          [
            Expr.Symbol(Token.Symbol("expected", 0, 19)),
            Expr.Symbol(Token.Symbol("expected", 0, 28)),
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

    it("should return quoted call expression", () => {
      expectInputReturns(`'(+ 1 1)`, [
        Expr.Quote(
          Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 2)), [
            Expr.Literal(1),
            Expr.Literal(1),
          ])
        ),
      ]);
    });

    it("should return nested quoted call expression", () => {
      expectInputReturns(`''(+ 1 1)`, [
        Expr.Quote(
          Expr.Quote(
            Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 3)), [
              Expr.Literal(1),
              Expr.Literal(1),
            ])
          )
        ),
      ]);
    });

    it("should return nested quoted call expression", () => {
      expectInputReturns(`'''(+ 1 1)`, [
        Expr.Quote(
          Expr.Quote(
            Expr.Quote(
              Expr.Call(Expr.Symbol(Token.Symbol("+", 0, 4)), [
                Expr.Literal(1),
                Expr.Literal(1),
              ])
            )
          )
        ),
      ]);
    });

    it("should return quoted list expression", () => {
      expectInputReturns(`'(1 a "Hello")`, [
        Expr.Quote(
          Expr.Literal([
            Expr.Literal(1),
            Expr.Symbol(Token.Symbol("a", 0, 4)),
            Expr.Literal("Hello"),
          ])
        ),
      ]);
    });

    it("should return nested quoted list expression", () => {
      expectInputReturns(`''(1 1)`, [
        Expr.Quote(
          Expr.Quote(Expr.Literal([Expr.Literal(1), Expr.Literal(1)]))
        ),
      ]);
    });

    it("should return nested quoted list expression", () => {
      expectInputReturns(`'''(1 1)`, [
        Expr.Quote(
          Expr.Quote(
            Expr.Quote(Expr.Literal([Expr.Literal(1), Expr.Literal(1)]))
          )
        ),
      ]);
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
