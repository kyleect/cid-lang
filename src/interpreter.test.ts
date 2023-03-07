import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

describe("Interpreter", () => {
  describe("atoms", () => {
    it("should return value of number atom", () => {
      expectInputReturns("1", 1);
    });

    it("should return value of list atom", () => {
      expectInputReturns(`"Hello World!"`, "Hello World!");
    });

    it("should return value of list atom", () => {
      expectInputReturns(`(list 1 2 3)`, [1, 2, 3]);
    });

    it("should return value of true boolean atom", () => {
      expectInputReturns(`#t`, true);
    });

    it("should return value of false boolean atom", () => {
      expectInputReturns(`#f`, false);
    });

    it("should return value of false boolean atom", () => {
      expectInputReturns(`()`, []);
    });
  });

  describe("operators", () => {
    it("should call *", () => {
      expectInputReturns(`(* 5 6)`, 30);
    });

    it("should call +", () => {
      expectInputReturns(`(+ 5 6)`, 11);
    });

    it("should call /", () => {
      expectInputReturns(`(/ 30 6)`, 5);
    });

    it("should call -", () => {
      expectInputReturns(`(- 30 5)`, 25);
    });
  });

  describe("conditionals", () => {
    it("should call = when true", () => {
      expectInputReturns(`(= 30 30)`, true);
    });

    it("should call = when false", () => {
      expectInputReturns(`(= 30 12)`, false);
    });

    it("should call not", () => {
      expectInputReturns(`(not #t)`, false);
    });

    it("should call string? when true", () => {
      expectInputReturns(`(string? "Hello")`, true);
    });

    it("should call string? when false", () => {
      expectInputReturns(`(string? 1)`, false);
    });

    it("should call number? when true", () => {
      expectInputReturns(`(number? 1)`, true);
    });

    it("should call number? when true", () => {
      expectInputReturns(`(number? "Hello World")`, false);
    });

    it("should call list? when true", () => {
      expectInputReturns(`(list? ())`, true);
    });

    it("should call list? when false", () => {
      expectInputReturns(`(list? 1)`, false);
    });

    it("should call if when true", () => {
      expectInputReturns(`(if (>= 10 1) "Hello" "World")`, "Hello");
    });

    it("should call if when false", () => {
      expectInputReturns(`(if (>= 1 10) "Hello" "World")`, "World");
    });
  });

  describe("variables", () => {
    it("should define a global variable", () => {
      expectInputReturns("(define x 5)(define y 10)\n(+ x y)", 15);
    });

    it("should set an existing global variable", () => {
      expectInputReturns("(define x 5)\n(set! x 10)\nx", 10);
    });

    it("should throw if set is called on undefined variable", () => {
      expect(() => interpretInput("(set! x 5)")).toThrow(
        "Unknown identifier: x"
      );
    });

    it("should define local variables", () => {
      expectInputReturns(`
        (define x 1)
        (let ((x 2) (y 4)) (set! x 100))
        x
      `, 1);
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
        625
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
        2
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
        11
      );
    });

    it('should have tail call optimization applied', () => {
      expectInputReturns(`
      (define sum-to
        (lambda (n acc)
          (if (= n 0)
            acc
            (sum-to (- n 1) (+ n acc)))))
      
      (sum-to 100000 0)
      `, 5000050000)
    });
  });
});

function interpretInput(input: string): unknown {
  const scanner = new Scanner(input);
  const tokens = scanner.scan();
  const parser = new Parser(tokens);

  const expressions = parser.parse();

  const interpreter = new Interpreter();

  return interpreter.interpretAll(expressions);
}

function expectInputReturns(input: string, expectedOutput: unknown) {
  expect(interpretInput(input)).toStrictEqual(expectedOutput);
}
