import { Environment } from "./env";
import { SchemeTSError } from "./exceptions";
import { EmptyListExpression, Expression } from "./expression";
import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";
import { Tokenizer } from "./tokenizer";

describe("Interpreter", () => {
  let env: Environment;

  beforeEach(() => {
    env = Environment.Default();
  });

  describe("atomics", () => {
    it("should intrepret number expressions", () => {
      expect(interpretExpression("123", env)).toBe(123);
    });

    it("should intrepret negative number expressions", () => {
      expect(interpretExpression("-123", env)).toBe(-123);
    });

    it("should intrepret number with decimal expressions", () => {
      expect(interpretExpression("123.45", env)).toBe(123.45);
    });

    it("should intrepret negative number with decimal expressions", () => {
      expect(interpretExpression("-123.45", env)).toBe(-123.45);
    });

    it("should intrepret string expressions", () => {
      expect(interpretExpression('"Hello World"', env)).toBe("Hello World");
    });
  });

  describe("lists", () => {
    it("should interpret empty parans as a list", () => {
      expect(interpretExpression("()", env)).toStrictEqual([]);
    });

    it("should interpret two empty lists to reference same object", () => {
      const [a, b] = interpretExpression("(() ())", env) as Expression[];

      expect(Object.is(a, EmptyListExpression)).toBe(true);
      expect(Object.is(b, EmptyListExpression)).toBe(true);
    });

    it("should interpret empty parans as a list", () => {
      expect(interpretExpression("(1)", env)).toStrictEqual([1]);
    });

    it("should interpret expressions parans as a list", () => {
      expect(
        interpretExpression(`(1 2 3 "Hello World" #t #f)`, env)
      ).toStrictEqual([1, 2, 3, "Hello World", true, false]);
    });

    it("should interpret lists starting with a non keyword, function or procedure symbol", () => {
      expect(interpretExpression("(define a 1)(a 2 3)", env)).toStrictEqual([
        1, 2, 3,
      ]);
    });

    it("should interpret lists starting with a symbol referencing a function", () => {
      expect(interpretExpression("(define a +)(a 2 3)", env)).toStrictEqual(5);
    });
  });

  describe("symbols", () => {
    it("should throw if referencing undefined symbol", () => {
      expect(() => interpretExpression("a", env)).toThrow(
        new SchemeTSError("Undefined symbol: a")
      );
    });

    it("should not throw if referencing defined symbol", () => {
      env.set("a", 123);

      expect(interpretExpression("a", env)).toBe(123);
    });

    describe("keywords", () => {
      describe("define", () => {
        it("should throw if referencing keyword define as variable", () => {
          expect(() => interpretExpression("define", env)).toThrow(
            new SchemeTSError("Illegal reference to keyword: define")
          );
        });

        it("should interpret define expressions", () => {
          expect(interpretExpression("(define x 123) x", env)).toBe(123);
        });
      });

      describe("set!", () => {
        it("should interpret set expressions on defined symbols", () => {
          expect(interpretExpression("(define x 123)(set! x 100) x", env)).toBe(
            100
          );
        });

        it("should throw on undefined symbols", () => {
          expect(() => interpretExpression("(set! x 100) x", env)).toThrow(
            new SchemeTSError("Unable to call set! on undefined symbol: x")
          );
        });
      });

      describe("quote", () => {
        it("should interpret quoted number expression", () => {
          expect(interpretExpression("(quote 123)", env)).toBe(123);
        });

        it("should interpret quoted call expression", () => {
          expect(interpretExpression("(quote (+ 1 2))", env)).toStrictEqual([
            Sym.of("+"),
            1,
            2,
          ]);
        });

        it("should interpret double quoted call expression", () => {
          expect(
            interpretExpression("(quote (quote (+ 1 2)))", env)
          ).toStrictEqual([Sym.Quote, [Sym.of("+"), 1, 2]]);
        });

        it("should interpret quoted true boolean expression", () => {
          expect(interpretExpression("(quote #t)", env)).toBe(true);
        });

        it("should interpret quoted false boolean expression", () => {
          expect(interpretExpression("(quote #f)", env)).toBe(false);
        });

        it("should interpret quoted if expression", () => {
          expect(
            interpretExpression("(quote (if #t #f #t))", env)
          ).toStrictEqual([Sym.If, true, false, true]);
        });

        it.skip("should throw if referencing keyword quote as variable", () => {
          expect(() => interpretExpression("quote", env)).toThrow(
            new SchemeTSError("Illegal reference to keyword: quote")
          );
        });

        describe("short quote", () => {
          it("should interpret quoted number expression", () => {
            expect(interpretExpression("'123", env)).toBe(123);
          });

          it("should interpret quoted number expression: quoted and unqoted list", () => {
            expect(interpretExpression("('123 123)", env)).toStrictEqual([
              123, 123,
            ]);
          });

          it("should interpret quoted number expression: quoted and unqoted list reversed", () => {
            expect(interpretExpression("(123 '123)", env)).toStrictEqual([
              123, 123,
            ]);
          });

          it("should interpret quoted list with symbols: list is quoted", () => {
            expect(interpretExpression("'(a b c)", env)).toStrictEqual([
              Sym.of("a"),
              Sym.of("b"),
              Sym.of("c"),
            ]);
          });

          it("should interpret quoted list with symbols: symbols are quoted", () => {
            expect(interpretExpression("('a 'b 'c)", env)).toStrictEqual([
              Sym.of("a"),
              Sym.of("b"),
              Sym.of("c"),
            ]);
          });

          it("should interpret quoted list with symbols: both are quoted", () => {
            expect(interpretExpression("'('a 'b 'c)", env)).toStrictEqual([
              [Sym.Quote, Sym.of("a")],
              [Sym.Quote, Sym.of("b")],
              [Sym.Quote, Sym.of("c")],
            ]);
          });

          it("should interpret quoted number expression", () => {
            expect(interpretExpression("'a", env)).toStrictEqual(Sym.of("a"));
          });

          it("should interpret quoted call expression", () => {
            expect(interpretExpression("'(+ 1 2)", env)).toStrictEqual([
              Sym.of("+"),
              1,
              2,
            ]);
          });

          it("should interpret double quoted call expression", () => {
            expect(interpretExpression("'(quote (+ 1 2))", env)).toStrictEqual([
              Sym.Quote,
              [Sym.of("+"), 1, 2],
            ]);
          });

          it("should interpret quoted true boolean expression", () => {
            expect(interpretExpression("'#t", env)).toBe(true);
          });

          it("should interpret quoted false boolean expression", () => {
            expect(interpretExpression("'#f", env)).toBe(false);
          });

          it("should interpret quoted if expression", () => {
            expect(interpretExpression("'(if #t #f #t)", env)).toStrictEqual([
              Sym.If,
              true,
              false,
              true,
            ]);
          });

          it("should interpret quoted if expression", () => {
            expect(interpretExpression("'(lambda (x) x)", env)).toStrictEqual([
              Sym.Lambda,
              [Sym.of("x")],
              Sym.of("x"),
            ]);
          });

          it("should interpret quoted if expression: quoted return value", () => {
            expect(
              interpretExpression("((lambda (x) 'x) 10)", env)
            ).toStrictEqual(Sym.of("x"));
          });
        });
      });

      describe("lambda", () => {
        it("should throw if referencing keyword lambda as variable", () => {
          expect(() => interpretExpression("lambda", env)).toThrow(
            new SchemeTSError("Illegal reference to keyword: lambda")
          );
        });

        it.skip("should interpret lambda expressions", () => {
          expect(interpretExpression("(lambda (x) x)", env)).toStrictEqual(
            "(lambda (x) x)"
          );
        });

        it("should interpret lambda expression calls", () => {
          expect(interpretExpression("((lambda (x) x) 10)", env)).toStrictEqual(
            10
          );
        });

        it("should interpret lambda expression calls: defined lambda", () => {
          expect(
            interpretExpression("(define id (lambda (x) x))(id 10)", env)
          ).toStrictEqual(10);
        });

        it("should interpret lambda expression calls: defined nested lambda", () => {
          expect(
            interpretExpression(
              `
              (define sum
                (lambda (a)
                  (lambda (b) (+ a b))))
              (define sum2 (sum 2))
              (sum2 10)
            `,
              env
            )
          ).toStrictEqual(12);
        });
      });

      describe("if", () => {
        it("should interpret if expression: identity boolean", () => {
          expect(interpretExpression("(if #t #t #f)", env)).toBe(true);
        });

        it("should interpret if expression: toogle boolean", () => {
          expect(interpretExpression("(if #t #f #t)", env)).toBe(false);
        });

        it("should throw if referencing keyword if as variable", () => {
          expect(() => interpretExpression("if", env)).toThrow(
            new SchemeTSError("Illegal reference to keyword: if")
          );
        });
      });
    });
  });

  describe("built ins", () => {
    it("should interpret addition call expression", () => {
      expect(interpretExpression("(+ 10 15)", env)).toBe(25);
    });

    it("should interpret greater than call expression: is greater than", () => {
      expect(interpretExpression("(> 10 1)", env)).toBe(true);
    });

    it("should interpret greater than call expression: is not greater than", () => {
      expect(interpretExpression("(> 1 10)", env)).toBe(false);
    });

    it("should interpret greater than call expression: is equal", () => {
      expect(interpretExpression("(> 10 10)", env)).toBe(false);
    });

    describe("display", () => {
      let originalConsoleLog;

      beforeEach(() => {
        originalConsoleLog = console.log;
        console.log = jest.fn();
      });

      afterEach(() => {
        console.log = originalConsoleLog;
      });

      it("should interpret display expression", () => {
        interpretExpression(`(define name "World")(display "Hello" name)`, env);

        expect(console.log).toBeCalledWith("Hello", "World");
      });
    });

    describe("equals?", () => {
      it("should return true for the same number", () => {
        expect(interpretExpression("(equal? 123 123)", env)).toBe(true);
      });

      it("should return true for the same quoted number", () => {
        expect(interpretExpression("(equal? '123 '123)", env)).toBe(true);
      });

      it("should return true for the same mixed quoted number", () => {
        expect(interpretExpression("(equal? '123 123)", env)).toBe(true);
      });

      it("should return true for the same symbol", () => {
        expect(interpretExpression("(equal? 'a 'a)", env)).toBe(true);
      });
    });
  });

  describe("booleans", () => {
    it("should interpret true expression", () => {
      expect(interpretExpression("#t", env)).toBe(true);
    });

    it("should interpret false expression", () => {
      expect(interpretExpression("#f", env)).toBe(false);
    });

    describe("boolean?", () => {
      it("should return true for true boolean expressions", () => {
        expect(interpretExpression("(boolean? #t)", env)).toBe(true);
      });

      it("should return true for false boolean expressions", () => {
        expect(interpretExpression("(boolean? #f)", env)).toBe(true);
      });

      it("should return false for truthy number expressions", () => {
        expect(interpretExpression("(boolean? 1)", env)).toBe(false);
      });

      it("should return false for falsey number expressions", () => {
        expect(interpretExpression("(boolean? 0)", env)).toBe(false);
      });

      it("should return false for empty list expressions", () => {
        expect(interpretExpression("(boolean? ())", env)).toBe(false);
      });
    });
  });

  it("should intepret multiple levels of env scope: lambdas", () => {
    expect(
      interpretExpression(
        `
    (define passed 0)
    (define failed 0)
    (define incPass
      (lambda ()
        (set! passed (+ passed 1))))
    (define incFail
      (lambda ()
        (set! failed (+ failed 1))))
    
    (incPass)
    (incPass)
    (incFail)
    (passed failed)
    `,
        env
      )
    ).toStrictEqual([2, 1]);
  });

  it("should intepret multiple levels of env scope: no lambdas", () => {
    expect(
      interpretExpression(
        `
    (define passed 0)
    (define failed 0)
    
    (set! passed (+ passed 1))
    (set! passed (+ passed 1))
    (set! failed (+ failed 1))
    (passed failed)
    `,
        env
      )
    ).toStrictEqual([2, 1]);
  });

  it("should throw on illegal expression value: Error", () => {
    const interpreter = new Interpreter();
    const error = new Error("Not a valid value");

    expect(() => interpreter.interpretProgram(error)).toThrow(
      new SchemeTSError(
        `Illegal expression. Value is not atomic or list expression: ${error}`
      )
    );
  });

  it("should throw on illegal expression value: Javascript Symbol", () => {
    const interpreter = new Interpreter();
    const symbol = Symbol("Not a valid value");

    // @ts-expect-error Testing
    expect(() => interpreter.interpretProgram(symbol)).toThrow(
      new SchemeTSError(
        `Illegal expression. Value is not atomic or list expression: ${String(
          symbol
        )}`
      )
    );
  });
});

function interpretExpression(
  source: string,
  testEnv?: Environment
): Expression | Procedure | ((...args) => Expression) {
  const tokenizer = Tokenizer.String(source);
  const tokens = tokenizer.tokenize();

  const parser = Parser.Token(tokens);
  const program = parser.parse();

  const env = new Environment(null, testEnv);

  const interpreter = new Interpreter(env);

  const value = interpreter.interpretProgram(program);

  return value;
}
