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
      expectInputReturns("(define x 1)\n(let ((x 2) (y 4)))\nx", 1);
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
