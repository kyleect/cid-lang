import { Cell } from "./cell";
import { Environment } from "./env";
import { CIDLangRuntimeError } from "./errors";
import {
  Expression,
  ListExpression,
  NullExpression,
  isListExpression,
  isPairExpression,
} from "./expression";
import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Sym } from "./symbol";
import { Tokenizer } from "./tokenizer";

describe("Interpreter", () => {
  let env: Environment;

  beforeEach(() => {
    env = Environment.Default();
  });

  it("should ignore comments", () => {
    expect(
      interpretExpression(
        `
    ; Toggle
    (if #t #f #t) ; Flip
    ; )
    `,
        env
      )
    ).toStrictEqual(false);
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

    it("should interpret number? call expression: number", () => {
      expect(interpretExpression(`(number? 123)`, env)).toBe(true);
    });

    it("should interpret number? call expression: quoted number", () => {
      expect(interpretExpression(`(number? '123)`, env)).toBe(true);
    });

    it("should interpret number? call expression: negative number", () => {
      expect(interpretExpression(`(number? -123)`, env)).toBe(true);
    });

    it("should interpret number? call expression: decimal", () => {
      expect(interpretExpression(`(number? 123.45)`, env)).toBe(true);
    });

    it("should interpret number? call expression: negative decimal", () => {
      expect(interpretExpression(`(number? -123.45)`, env)).toBe(true);
    });

    it("should interpret number? call expression: boolean true", () => {
      expect(interpretExpression(`(number? #t)`, env)).toBe(false);
    });

    it("should interpret number? call expression: boolean false", () => {
      expect(interpretExpression(`(number? #f)`, env)).toBe(false);
    });

    it("should interpret number? call expression: empty list", () => {
      expect(interpretExpression(`(number? ())`, env)).toBe(false);
    });

    it("should interpret number? call expression: list with numbers", () => {
      expect(interpretExpression(`(number? (1 2 3))`, env)).toBe(false);
    });

    it("should interpret number? call expression: list with number", () => {
      expect(interpretExpression(`(number? (1))`, env)).toBe(false);
    });

    it("should interpret number? call expression: symbol", () => {
      expect(interpretExpression(`(number? 'a)`, env)).toBe(false);
    });

    it("should interpret number? call expression: string", () => {
      expect(interpretExpression(`(number? "Hello")`, env)).toBe(false);
    });

    it("should interpret number? call expression: zero args", () => {
      expect(() => interpretExpression(`(number?)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function 'number?' expects 1 arguments but received 0`
        )
      );
    });

    it("should intrepret string expressions", () => {
      expect(interpretExpression('"Hello World"', env)).toBe("Hello World");
    });
  });

  describe("lists", () => {
    it("should interpret empty parans as a list", () => {
      const result = interpretExpression("()", env);

      expect(result).toBe(NullExpression);
    });

    it("should interpret two empty lists to reference same object", () => {
      const result = interpretExpression("(() ())", env);

      expect(isListExpression(result)).toBe(true);

      const resultArr = Array.from(result as ListExpression);

      expect(resultArr).toHaveLength(2);

      const [a, b] = resultArr;

      expect(Object.is(a, NullExpression)).toBe(true);

      expect(Object.is(b, NullExpression)).toBe(true);
    });

    it("should interpret empty parans as a list", () => {
      expect(interpretExpression("(1)", env)).toStrictEqual(
        Cell.of(1, NullExpression)
      );
    });

    it("should interpret expressions parans as a list", () => {
      expect(
        interpretExpression(`(1 2 3 "Hello World" #t #f)`, env)
      ).toStrictEqual(Cell.list(1, 2, 3, "Hello World", true, false));
    });

    it("should interpret lists starting with a non keyword, function or procedure symbol", () => {
      expect(interpretExpression("(define a 1)(a 2 3)", env)).toStrictEqual(
        Cell.list(1, 2, 3)
      );
    });

    it("should interpret lists starting with a symbol referencing a function", () => {
      expect(interpretExpression("(define a +)(a 2 3)", env)).toStrictEqual(5);
    });
  });

  describe("symbols", () => {
    it("should throw if referencing undefined symbol", () => {
      expect(() => interpretExpression("a", env)).toThrow(
        new CIDLangRuntimeError("Undefined symbol: a")
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
            new CIDLangRuntimeError("Illegal reference to keyword: define")
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
            new CIDLangRuntimeError(
              "Unable to call set! on undefined symbol: x"
            )
          );
        });
      });

      describe("quote", () => {
        it("should interpret quoted number expression", () => {
          expect(interpretExpression("(quote 123)", env)).toBe(123);
        });

        it("should interpret quoted call expression", () => {
          expect(interpretExpression("(quote (+ 1 2))", env)).toStrictEqual(
            Cell.list(Sym.of("+"), 1, 2)
          );
        });

        it("should interpret double quoted call expression", () => {
          expect(
            interpretExpression("(quote (quote (+ 1 2)))", env)
          ).toStrictEqual(Cell.list(Sym.Quote, Cell.list(Sym.of("+"), 1, 2)));
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
          ).toStrictEqual(Cell.list(Sym.If, true, false, true));
        });

        it.skip("should throw if referencing keyword quote as variable", () => {
          expect(() => interpretExpression("quote", env)).toThrow(
            new CIDLangRuntimeError("Illegal reference to keyword: quote")
          );
        });

        describe("short quote", () => {
          it("should interpret quoted number expression", () => {
            expect(interpretExpression("'123", env)).toBe(123);
          });

          it("should interpret quoted number expression: quoted and unqoted list", () => {
            expect(interpretExpression("('123 123)", env)).toStrictEqual(
              Cell.list(123, 123)
            );
          });

          it("should interpret quoted number expression: quoted and unqoted list reversed", () => {
            expect(interpretExpression("(123 '123)", env)).toStrictEqual(
              Cell.list(123, 123)
            );
          });

          it("should interpret quoted list with symbols: list is quoted", () => {
            expect(interpretExpression("'(a b c)", env)).toStrictEqual(
              Cell.list(Sym.of("a"), Sym.of("b"), Sym.of("c"))
            );
          });

          it("should interpret quoted list with symbols: symbols are quoted", () => {
            expect(interpretExpression("('a 'b 'c)", env)).toStrictEqual(
              Cell.list(Sym.of("a"), Sym.of("b"), Sym.of("c"))
            );
          });

          it("should interpret quoted list with symbols: both are quoted", () => {
            expect(interpretExpression("'('a 'b 'c)", env)).toStrictEqual(
              Cell.list(
                Cell.list(Sym.Quote, Sym.of("a")),
                Cell.list(Sym.Quote, Sym.of("b")),
                Cell.list(Sym.Quote, Sym.of("c"))
              )
            );
          });

          it("should interpret quoted number expression", () => {
            expect(interpretExpression("'a", env)).toStrictEqual(Sym.of("a"));
          });

          it("should interpret quoted call expression", () => {
            expect(interpretExpression("'(+ 1 2)", env)).toStrictEqual(
              Cell.list(Sym.of("+"), 1, 2)
            );
          });

          it("should interpret double quoted call expression", () => {
            expect(interpretExpression("'(quote (+ 1 2))", env)).toStrictEqual(
              Cell.list(Sym.Quote, Cell.list(Sym.of("+"), 1, 2))
            );
          });

          it("should interpret quoted true boolean expression", () => {
            expect(interpretExpression("'#t", env)).toBe(true);
          });

          it("should interpret quoted false boolean expression", () => {
            expect(interpretExpression("'#f", env)).toBe(false);
          });

          it("should interpret quoted if expression", () => {
            expect(interpretExpression("'(if #t #f #t)", env)).toStrictEqual(
              Cell.list(Sym.If, true, false, true)
            );
          });

          it("should interpret quoted if expression", () => {
            expect(interpretExpression("'(lambda (x) x)", env)).toStrictEqual(
              Cell.list(Sym.Lambda, Cell.list(Sym.of("x")), Sym.of("x"))
            );
          });

          it.skip("should interpret quoted if expression: quoted return value", () => {
            expect(
              interpretExpression("((lambda (x) 'x) 10)", env)
            ).toStrictEqual(Sym.of("x"));
          });
        });
      });

      describe("lambda", () => {
        it("should throw if referencing keyword lambda as variable", () => {
          expect(() => interpretExpression("lambda", env)).toThrow(
            new CIDLangRuntimeError("Illegal reference to keyword: lambda")
          );
        });

        it.skip("should interpret lambda expressions", () => {
          expect(interpretExpression("(lambda (x) x)", env)).toStrictEqual(
            "(lambda (x) x)"
          );
        });

        it("should interpret defining lambda expression", () => {
          expect(() =>
            interpretExpression(`(define fn (lambda (a b) (+ a b)))`, env)
          ).not.toThrow();
        });

        it("should interpret defining lambda expression then calling", () => {
          expect(
            interpretExpression(
              `(define fn (lambda (a b) (+ a b)))(fn 5 10)`,
              env
            )
          ).toBe(15);
        });

        it.skip("should interpret lambda expression calls", () => {
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
            new CIDLangRuntimeError("Illegal reference to keyword: if")
          );
        });
      });
    });
  });

  describe("built ins", () => {
    it("should interpret addition call expression", () => {
      expect(interpretExpression("(+ 10 15)", env)).toBe(25);
    });

    it("should interpret addition call expression: no args", () => {
      expect(() => interpretExpression(`(+)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '+' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret addition call expression: one arg", () => {
      expect(() => interpretExpression(`(+ 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '+' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret addition call expression: three args", () => {
      expect(interpretExpression(`(+ 10 2 100)`, env)).toBe(12);
    });

    it("should interpret addition call expression: non numbers", () => {
      expect(() => interpretExpression(`(+ "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });

    it("should interpret substraction call expression", () => {
      expect(interpretExpression("(- 10 15)", env)).toBe(-5);
    });

    it("should interpret substraction call expression: no args", () => {
      expect(() => interpretExpression(`(-)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '-' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret substraction call expression: one arg", () => {
      expect(() => interpretExpression(`(- 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '-' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret substraction call expression: three args", () => {
      expect(interpretExpression(`(- 10 2 100)`, env)).toBe(8);
    });

    it("should interpret substraction call expression: non numbers", () => {
      expect(() => interpretExpression(`(- "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });

    it("should interpret multiply call expression", () => {
      expect(interpretExpression("(* 10 15)", env)).toBe(150);
    });

    it("should interpret multiply call expression: no args", () => {
      expect(() => interpretExpression(`(*)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '*' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret multiply call expression: one arg", () => {
      expect(() => interpretExpression(`(* 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '*' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret multiply call expression: three args", () => {
      expect(interpretExpression(`(* 10 2 100)`, env)).toBe(20);
    });

    it("should interpret multiply call expression: non numbers", () => {
      expect(() => interpretExpression(`(* "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });

    it("should interpret divide call expression", () => {
      expect(interpretExpression("(/ 10 5)", env)).toBe(2);
    });

    it("should interpret divide call expression: no args", () => {
      expect(() => interpretExpression(`(/)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '/' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret divide call expression: one arg", () => {
      expect(() => interpretExpression(`(/ 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '/' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret divide call expression: three args", () => {
      expect(interpretExpression(`(/ 10 2 100)`, env)).toBe(5);
    });

    it("should interpret divide call expression: non numbers", () => {
      expect(() => interpretExpression(`(/ "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });

    it("should interpret divide call expression: divide by zero", () => {
      expect(() => interpretExpression("(/ 10 0)", env)).toThrow(
        new CIDLangRuntimeError("Dividing by zero")
      );
    });

    it("should interpret divide call expression: divide by zero (flipped)", () => {
      expect(() => interpretExpression("(/ 0 10)", env)).toThrow(
        new CIDLangRuntimeError("Dividing by zero")
      );
    });

    it("should interpret divide call expression: divide by zero (both)", () => {
      expect(() => interpretExpression("(/ 0 0)", env)).toThrow(
        new CIDLangRuntimeError("Dividing by zero")
      );
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

    it("should interpret greater than  call expression: no args", () => {
      expect(() => interpretExpression(`(>)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '>' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret greater than  call expression: one arg", () => {
      expect(() => interpretExpression(`(> 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '>' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret greater than  call expression: three args", () => {
      expect(interpretExpression(`(> 10 2 100)`, env)).toBe(true);
    });

    it("should interpret greater than  call expression: non numbers", () => {
      expect(() => interpretExpression(`(> "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });

    it("should interpret less than call expression: is less than", () => {
      expect(interpretExpression("(< 1 10)", env)).toBe(true);
    });

    it("should interpret less than call expression: is not less than", () => {
      expect(interpretExpression("(< 10 1)", env)).toBe(false);
    });

    it("should interpret less than call expression: is equal", () => {
      expect(interpretExpression("(< 10 10)", env)).toBe(false);
    });

    it("should interpret less than call expression: no args", () => {
      expect(() => interpretExpression(`(<)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '<' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret less than call expression: one arg", () => {
      expect(() => interpretExpression(`(< 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '<' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret less than call expression: three args", () => {
      expect(interpretExpression(`(< 2 10 100)`, env)).toBe(true);
    });

    it("should interpret less than call expression: non numbers", () => {
      expect(() => interpretExpression(`(< "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });

    it("should interpret greater than or equal to call expression: is greater than", () => {
      expect(interpretExpression("(>= 10 1)", env)).toBe(true);
    });

    it("should interpret greater than or equal to call expression: is not greater than", () => {
      expect(interpretExpression("(>= 1 10)", env)).toBe(false);
    });

    it("should interpret greater than or equal to call expression: is equal", () => {
      expect(interpretExpression("(>= 10 10)", env)).toBe(true);
    });

    it("should interpret greater than or equal to call expression: no args", () => {
      expect(() => interpretExpression(`(>=)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '>=' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret greater than or equal to call expression: one arg", () => {
      expect(() => interpretExpression(`(>= 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '>=' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret greater than or equal to call expression: three args", () => {
      expect(interpretExpression(`(>= 10 2 100)`, env)).toBe(true);
    });

    it("should interpret greater than or equal to call expression: non numbers", () => {
      expect(() => interpretExpression(`(>= "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
    });
    //

    it("should interpret less than or equal to call expression: is less than", () => {
      expect(interpretExpression("(<= 1 10)", env)).toBe(true);
    });

    it("should interpret less than or equal to call expression: is not less than", () => {
      expect(interpretExpression("(<= 10 1)", env)).toBe(false);
    });

    it("should interpret less than or equal to call expression: is equal", () => {
      expect(interpretExpression("(<= 10 10)", env)).toBe(true);
    });

    it("should interpret less than or equal to call expression: no args", () => {
      expect(() => interpretExpression(`(<=)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '<=' expects 2 arguments but received 0`
        )
      );
    });

    it("should interpret less than or equal to call expression: one arg", () => {
      expect(() => interpretExpression(`(<= 10)`, env)).toThrow(
        new CIDLangRuntimeError(
          `Function '<=' expects 2 arguments but received 1: 10`
        )
      );
    });

    it("should interpret less than or equal to call expression: three args", () => {
      expect(interpretExpression(`(<= 2 10 100)`, env)).toBe(true);
    });

    it("should interpret less than or equal to call expression: non numbers", () => {
      expect(() => interpretExpression(`(<= "Hello" 'a)`, env)).toThrow(
        new CIDLangRuntimeError(`All arguments must be numbers`)
      );
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

    describe("car", () => {
      it("should interpret car call expression", () => {
        expect(interpretExpression(`(car (1 2 3))`, env)).toBe(1);
      });

      it("should interpret car call expression: atomic expression", () => {
        expect(() => interpretExpression(`(car 1)`, env)).toThrow(
          new CIDLangRuntimeError("Argument must be a pair expression: 1")
        );
      });

      it("should interpret car call expression: zero args", () => {
        expect(() => interpretExpression(`(car)`, env)).toThrow(
          new CIDLangRuntimeError(
            `Function 'car' expects 1 arguments but received 0`
          )
        );
      });
    });

    describe("cons", () => {
      it("should interpret cons call expression: list then atom", () => {
        const value = interpretExpression(`(cons (list 2 3) 1)`, env);
        const expected = Cell.of(Cell.list(2, 3), 1);

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });

      it("should interpret cons call expression: atom then list", () => {
        const value = interpretExpression(`(cons 1 (list 2 3))`, env);
        const expected = Cell.list(1, 2, 3);

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });

      it("should interpret cons call expression: atom then atom", () => {
        const value = interpretExpression(`(cons 1 2)`, env);
        const expected = Cell.of(1, 2);

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });

      it("should interpret cons call expression: list then list", () => {
        const value = interpretExpression(`(cons (1) (2 3 4))`, env);
        const expected = Cell.list(Cell.list(1), 2, 3, 4);

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });

      it("should interpret cons call expression: atom then empty list", () => {
        const value = interpretExpression(`(cons 1 ())`, env);
        const expected = Cell.list(1);

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });

      it("should interpret cons call expression: nested atom then empty list", () => {
        const value = interpretExpression(`(cons 1 (cons 2 ()))`, env);
        const expected = Cell.list(1, 2);

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });

      it("should interpret cons call expression: improper list", () => {
        const value = interpretExpression(`(cons 1 (cons 2 3))`, env);
        const expected = Cell.of(1, Cell.of(2, 3));

        expect(value).toStrictEqual(expected);
        expect(isPairExpression(value)).toBe(true);
      });
    });

    describe("cdr", () => {
      it("should interpret cdr call expression", () => {
        expect(interpretExpression(`(cdr (1 2 3))`, env)).toStrictEqual(
          Cell.list(2, 3)
        );
      });

      it("should interpret cdr call expression: single item list", () => {
        expect(interpretExpression(`(cdr (1))`, env)).toBe(NullExpression);
      });

      it("should interpret cdr call expression: empty list", () => {
        expect(interpretExpression(`(cdr ())`, env)).toBe(NullExpression);
      });

      it("should interpret cdr call expression: atomic expression", () => {
        expect(() => interpretExpression(`(cdr 1)`, env)).toThrow(
          new CIDLangRuntimeError("Argument must be a list expression: 1")
        );
      });

      it("should interpret cdr call expression: zero args", () => {
        expect(() => interpretExpression(`(cdr)`, env)).toThrow(
          new CIDLangRuntimeError(
            `Function 'cdr' expects 1 arguments but received 0`
          )
        );
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
    ).toStrictEqual(Cell.list(2, 1));
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
    ).toStrictEqual(Cell.list(2, 1));
  });

  it("should throw on illegal expression value: Error", () => {
    const interpreter = new Interpreter();
    const error = new Error("Not a valid value");

    // @ts-expect-error Testing
    expect(() => interpreter.interpretProgram(error)).toThrow(
      new CIDLangRuntimeError(
        `Illegal program. Program must be a sequence of expressions: ${error}`
      )
    );
  });
});

function interpretExpression(source: string, env: Environment): Expression {
  const tokenizer = Tokenizer.String(source);
  const tokens = tokenizer.tokenize();

  const parser = Parser.Token(tokens);
  const program = parser.parse();

  const interpreter = new Interpreter(env);

  const value = interpreter.interpretProgram(program);

  return value;
}
