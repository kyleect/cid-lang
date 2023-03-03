import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

describe("Interpreter", () => {
  describe("atoms", () => {
    it("should return value of number atom", () => {
      const scanner = new Scanner("1");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(1);
    });

    it("should return value of list atom", () => {
      const scanner = new Scanner('"Hello World!"');
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(
        "Hello World!"
      );
    });

    it("should return value of list atom", () => {
      const scanner = new Scanner("(list 1 2 3)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual([1, 2, 3]);
    });

    it("should return value of true boolean atom", () => {
      const scanner = new Scanner("#t");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(true);
    });

    it("should return value of false boolean atom", () => {
      const scanner = new Scanner("#f");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(false);
    });

    it("should return value of false boolean atom", () => {
      const scanner = new Scanner("()");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual([]);
    });
  });

  describe("operators", () => {
    it("should call *", () => {
      const scanner = new Scanner("(* 5 6)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(30);
    });

    it("should call +", () => {
      const scanner = new Scanner("(+ 5 6)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(11);
    });

    it("should call /", () => {
      const scanner = new Scanner("(/ 30 6)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(5);
    });

    it("should call -", () => {
      const scanner = new Scanner("(- 30 5)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(25);
    });
  });

  describe("conditionals", () => {
    it("should call = when true", () => {
      const scanner = new Scanner("(= 30 30)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(true);
    });

    it("should call = when false", () => {
      const scanner = new Scanner("(= 30 12)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(false);
    });

    it("should call not", () => {
      const scanner = new Scanner("(not #t)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(false);
    });

    it("should call number? when true", () => {
      const scanner = new Scanner("(number? 1)");
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      debugger;

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(true);
    });

    it("should call number? when true", () => {
      const scanner = new Scanner(`(number? "Hello World")`);
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(false);
    });

    it("should call list? when true", () => {
      const scanner = new Scanner(`(list? ())`);
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(true);
    });

    it("should call list? when false", () => {
      const scanner = new Scanner(`(list? 1)`);
      const tokens = scanner.scan();
      const parser = new Parser(tokens);

      const expressions = parser.parse();

      const interpreter = new Interpreter();

      expect(interpreter.interpretAll(expressions)).toStrictEqual(false);
    });
  });
});
