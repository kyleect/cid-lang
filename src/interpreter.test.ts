import { exec } from ".";
import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

describe("Interpreter", () => {
  describe("atoms", () => {
    it("should return value of number atom", () => {
      expectInputReturns("1", "1");
    });

    it("should return value of string atom", () => {
      expectInputReturns(`"Hello World!"`, '"Hello World!"');
    });

    it("should return value of list atom", () => {
      expectInputReturns(`(list 1 2 3)`, "(1 2 3)");
    });

    it("should return value of true boolean atom", () => {
      expectInputReturns(`#t`, "#t");
    });

    it("should return value of false boolean atom", () => {
      expectInputReturns(`#f`, "#f");
    });

    it("should return null for empty list atom", () => {
      expectInputReturns(`()`, "()");
    });
  });

  describe("operators", () => {
    it("should call *", () => {
      expectInputReturns(`(* 5 6)`, "30");
    });

    it("should call +", () => {
      expectInputReturns(`(+ 5 6)`, "11");
    });

    it("should call /", () => {
      expectInputReturns(`(/ 30 6)`, "5");
    });

    it("should call -", () => {
      expectInputReturns(`(- 30 5)`, "25");
    });
  });

  describe("conditionals", () => {
    it("should call = when true", () => {
      expectInputReturns(`(= 30 30)`, "#t");
    });

    it("should call = when false", () => {
      expectInputReturns(`(= 30 12)`, "#f");
    });

    it("should call not", () => {
      expectInputReturns(`(not #t)`, "#f");
    });

    it("should call string? when true", () => {
      expectInputReturns(`(string? "Hello")`, "#t");
    });

    it("should call string? when false", () => {
      expectInputReturns(`(string? 1)`, "#f");
    });

    it("should call number? when true", () => {
      expectInputReturns(`(number? 1)`, "#t");
    });

    it("should call number? when true", () => {
      expectInputReturns(`(number? "Hello World")`, "#f");
    });

    describe("list?", () => {
      it("should return true with null/empty list", () => {
        expectInputReturns(`(list? ())`, "#t");
      });

      it("should return false with number", () => {
        expectInputReturns(`(list? 1)`, "#f");
      });

      it("should return false with string", () => {
        expectInputReturns(`(list? "Hello World")`, "#f");
      });

      it("should return false with symbol", () => {
        expectInputReturns(`(list? 'a)`, "#f");
      });

      it("should return true for short quoted list for short quoted list in variable", () => {
        expectInputReturns(
          `
        (define a '(1 2 3))
        (list? a)`,
          "#t"
        );
      });

      it("should return true for short quoted list", () => {
        expectInputReturns(`(list? '(1 2 3))`, "#t");
      });

      it("should return true for list", () => {
        expectInputReturns(`(list? (1 2 3))`, "#t");
      });
    });

    it("should call if when true", () => {
      expectInputReturns(`(if (>= 10 1) "Hello" "World")`, '"Hello"');
    });

    it("should call if when false", () => {
      expectInputReturns(`(if (>= 1 10) "Hello" "World")`, '"World"');
    });
  });

  describe("variables", () => {
    it("should define a global variable", () => {
      expectInputReturns("(define x 5)(define y 10)\n(+ x y)", "15");
    });

    it("should set an existing global variable", () => {
      expectInputReturns("(define x 5)\n(set! x 10)\nx", "10");
    });

    it("should throw if set is called on undefined variable", () => {
      expect(() => interpretInput("(set! x 5)")).toThrow(
        "Unknown identifier: x"
      );
    });

    it("should define local variables", () => {
      expectInputReturns(
        `
        (define x 1)
        (let ((x 2) (y 4)) (set! x 100))
        x
      `,
        "1"
      );
    });

    it("should throw when referencing local variables out of scope", () => {
      expect(() =>
        interpretInput("(define x 1)\n(let ((x 2) (y 4)))\ny")
      ).toThrow("Unknown identifier: y");
    });

    it("should use variables across scopes", () => {
      const scanner = new Scanner(
        "(define max 100)\n(let ((min 10)) (display min) (display max))"
      );
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      const displaySpy = jest.fn();

      interpreter.envSet("display", displaySpy);

      interpreter.interpretAll(expressions);

      expect(displaySpy.mock.calls).toEqual([[[10]], [[100]]]);
    });
  });

  describe("lambdas", () => {
    it("should work", () => {
      expectInputReturns(
        `(define square (lambda (x) (* x x)))
         (define result (square (square 5)))
         result`,
        "625"
      );
    });

    it("should work 2", () => {
      expectInputReturns(
        `(define square (lambda (x) x))
         (define result (square 5))
         result`,
        "5"
      );
    });

    it("should work with no body expressions", () => {
      expectInputReturns(
        `(define square (lambda (x)))
         (define result (square (square 5)))
         result`,
        undefined
      );
    });

    it("should work with closures", () => {
      expectInputReturns(
        `(define count 0)
         (define increment (lambda ()
           (set! count (+ count 1))))
         
         (increment)
         (increment)
         count`,
        "2"
      );
    });

    it("should use current closure values at call time", () => {
      expectInputReturns(
        `(define count 0)
         (define increment (lambda ()
           (set! count (+ count 1))))
         
         (increment)

         (set! count 10)

         (increment)
         count`,
        "11"
      );
    });

    describe("tail call optimization", () => {
      it("should have tail call optimization applied; Example: sum-to", () => {
        expectInputReturns(
          `
        (define a 0)
        (define sum-to
          (lambda (n acc)
            (set! a (+ a 1))
            (if (= n 0)
              acc
              (sum-to (- n 1) (+ n acc)))))
        
        (sum-to 100000 0)
        `,
          "5000050000"
        );
      });

      it.skip("should have tail call optimization applied; Example: count", () => {
        expectInputReturns(
          `
        (define first car)
        (define rest cdr)
  
        (define count (lambda (item L) (if L (+ (= item (first L)) (count item (rest L))) 0)))
  
        (count 0 (list 0 1 2 3 0 0))
        `,
          "3"
        );
      });

      it("should have tail call optimization applied; Example: range", () => {
        expectInputReturns(
          `
        (define range (lambda (a b) (if (= a b) '() (cons a (range (+ a 1) b)))))
        (range 0 10)
        `,
          "(0 1 2 3 4 5 6 7 8 9)"
        );
      });
    });
  });

  describe("quoting", () => {
    describe("quote procedure", () => {
      it("should return list when quoting empty parans", () => {
        expectInputReturns(`(quote ())`, "()");
      });

      it("should return lambda when quoting lambda", () => {
        expectInputReturns(`(quote (lambda (x) x))`, "(lambda (x) x)");
      });

      it("should return lambda when double quoting lambda", () => {
        expectInputReturns(`(quote (quote (lambda (x) x)))`, "'(lambda (x) x)");
      });

      it("should return list with values", () => {
        expectInputReturns(`(quote (list 1 2 3))`, "(list 1 2 3)");
      });

      it("should return list with values when quote is nested", () => {
        expectInputReturns(`(quote (quote (list 1 2 3)))`, "'(list 1 2 3)");
      });

      it("should return symbol", () => {
        expectInputReturns(`(quote a)`, "a");
      });

      it("should return expression argument without evaluating it", () => {
        expectInputReturns(`(quote (+ 1 1))`, "(+ 1 1)");
      });

      it("should also work on this", () => {
        expectInputReturns(
          `
        (define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))
        (range 0 10)
        `,
          "(0 1 2 3 4 5 6 7 8 9)"
        );
      });
    });

    describe("short quote", () => {
      it("should return list when quoting empty parans", () => {
        expectInputReturns(`'()`, "()");
      });

      it("should return list when double quoting empty parans", () => {
        expectInputReturns(`''()`, "'()");
      });

      it("should return list when quoting parans with valuess", () => {
        expectInputReturns(`'(1 2 3)`, "(1 2 3)");
      });

      it("should return list with values", () => {
        expectInputReturns(`'(list 1 2 3)`, "(list 1 2 3)");
      });

      it("should return list with values when shortc quote is nested", () => {
        expectInputReturns(`''(list 1 2 3)`, "'(list 1 2 3)");
      });

      it("should return symbol", () => {
        expectInputReturns(`'a`, "a");
      });

      it("should return symbol when double quoting", () => {
        expectInputReturns(`''a`, "'a");
      });

      it("should return expression argument without evaluating it", () => {
        expectInputReturns(`'(+ 1 1)`, "(+ 1 1)");
      });

      it("should return the quoted call expression when double quoted", () => {
        expectInputReturns(`''(+ 1 1)`, "'(+ 1 1)");
      });

      it("should return the quoted list expression when double quoted", () => {
        expectInputReturns(`''(1 1)`, "'(1 1)");
      });

      it("should return the double quoted list expression when triple quoted", () => {
        expectInputReturns(`'''(1 1)`, "''(1 1)");
      });
    });
  });

  describe("eval", () => {
    it("should return result of eval", () => {
      expectInputReturns(`(eval 2)`, "2");
    });

    it("should return result of eval with quoted value", () => {
      expectInputReturns(`(eval '2)`, "2");
    });

    it("should return result of eval when nested", () => {
      expectInputReturns(`(eval (eval 2))`, "2");
    });

    it("should evaulate quoted expressions from quote procedure: Example: double quoted", () => {
      expectInputReturns(
        `
      (define q (quote (quote (+ 1 1))))
      (eval (eval q))`,
        "2"
      );
    });

    it("should evaulate quoted expressions from quote procedure: Example: list", () => {
      expectInputReturns(
        `
      (define a (quote (list 1 2)))
      (eval a)
      `,
        "(1 2)"
      );
    });

    it("should evaulate short quoted expressions: Example: double quoted call expression", () => {
      expectInputReturns(
        `
      (define q ''(+ 1 1))
      (eval (eval q))`,
        "2"
      );
    });

    it("should eval short quoted expressions; Example: quoted list call expression", () => {
      expectInputReturns(
        `
      (define a '(list 1 2))
      (eval a)
      `,
        "(1 2)"
      );
    });

    it("should eval short quoted expressions; Example: double quoted list call expression", () => {
      expectInputReturns(
        `
      (define a ''(list 1 2))
      (eval (eval a))
      `,
        "(1 2)"
      );
    });

    it("should eval a quoted lambda", () => {
      expectInputReturns(
        `
        (define a '(lambda (x) x))
        (define b ((eval a) 100))
        b
      `,
        "100"
      );
    });
  });

  describe("built in procedures", () => {
    describe("null?", () => {
      it("should be null? when quoting empty list", () => {
        expectInputReturns(`(null? (quote ()))`, "#t");
      });

      it("should be null? when quoting empty list", () => {
        expectInputReturns(`(null? '())`, "#t");
      });

      it("should be null? when empty params", () => {
        expectInputReturns(`(null? ())`, "#t");
      });

      it("should return false if value is number", () => {
        expectInputReturns(`(null? 0)`, "#f");
      });
    });

    describe("car", () => {
      it("should return the first element of quoted expression", () => {
        expectInputReturns("(car '(+ 2 3))", "+");
      });

      it("should return the first element of list expression", () => {
        expectInputReturns("(car '(1 2 3))", "1");
      });
    });

    describe("cdr", () => {
      it("should return the rest of elements from quoted expression", () => {
        expectInputReturns("(cdr '(+ 2 3))", "(2 3)");
      });

      it("should return the rest of elements from list expression", () => {
        expectInputReturns("(cdr '(1 2 3))", "(2 3)");
      });
    });
  });
});

function interpretInput(input: string): unknown {
  return exec(input);
}

function expectInputReturns(input: string, expectedOutput: unknown) {
  expect(interpretInput(input)).toStrictEqual(expectedOutput);
}
