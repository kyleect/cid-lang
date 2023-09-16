import { Cell } from "./cell";
import { Environment } from "./env";
import {
  NullExpression,
  isAtomicExpression,
  isListExpression,
  isPairExpression,
} from "./expression";
import { Procedure } from "./procedure";
import { Sym } from "./symbol";

describe("Expression", () => {
  describe("isAtomicExpression", () => {
    it("should return that string are atomic expressions", () => {
      expect(isAtomicExpression("Hello World")).toBe(true);
    });

    it("should return that numbers are atomic expressions", () => {
      expect(isAtomicExpression(123)).toBe(true);
    });

    it("should return that negative numbers are atomic expressions", () => {
      expect(isAtomicExpression(-123)).toBe(true);
    });

    it("should return that numbers with decimals are atomic expressions", () => {
      expect(isAtomicExpression(123.45)).toBe(true);
    });

    it("should return that negative numbers with decimals are atomic expressions", () => {
      expect(isAtomicExpression(-123.45)).toBe(true);
    });

    it("should return that symbol references are atomic expressions", () => {
      expect(isAtomicExpression(Sym.of("Hello"))).toBe(true);
    });

    it("should return that empty arrays are not atomic expressions", () => {
      expect(isAtomicExpression([])).toBe(false);
    });

    it("should return that filled arrays are not atomic expressions", () => {
      expect(isAtomicExpression([1, 2, "World"])).toBe(false);
    });

    it("should return that objects are not atomic expressions", () => {
      expect(isAtomicExpression({})).toBe(false);
    });

    it("should return that booleans are atomic expressions: true", () => {
      expect(isAtomicExpression(true)).toBe(true);
    });

    it("should return that booleans are atomic expressions: false", () => {
      expect(isAtomicExpression(false)).toBe(true);
    });
  });

  describe("isListExpression", () => {
    it("should return that string are not list expressions", () => {
      expect(isListExpression("Hello World")).toBe(false);
    });

    it("should return that numbers are not list expressions", () => {
      expect(isListExpression(123)).toBe(false);
    });

    it("should return that negative numbers are not list expressions", () => {
      expect(isListExpression(-123)).toBe(false);
    });

    it("should return that numbers with decimals are not list expressions", () => {
      expect(isListExpression(123.45)).toBe(false);
    });

    it("should return that negative numbers with decimals are not list expressions", () => {
      expect(isListExpression(-123.45)).toBe(false);
    });

    it("should return that symbol references are not list expressions", () => {
      expect(isListExpression(Sym.of("Hello"))).toBe(false);
    });

    it("should return that empty arrays are not list expressions", () => {
      expect(isListExpression([])).toBe(true);
    });

    it("should return that common empty list reference is a list expression", () => {
      expect(isListExpression(NullExpression)).toBe(true);
    });

    it("should return that filled arrays are not list expressions", () => {
      expect(isListExpression([1, 2, "World"])).toBe(false);
    });

    it("should return that objects are list expressions", () => {
      expect(isListExpression({})).toBe(false);
    });

    it("should return that booleans are not list expressions: true", () => {
      expect(isListExpression(true)).toBe(false);
    });

    it("should return that booleans are not list expressions: false", () => {
      expect(isListExpression(false)).toBe(false);
    });

    it("should return procedure is list expression", () => {
      expect(
        isListExpression(
          new Procedure(
            Cell.list(Sym.of("a")),
            Cell.list(Sym.of("a")),
            new Environment()
          )
        )
      ).toBe(true);
    });
  });

  describe("isPairExpression", () => {
    it("should return that string are not pair expressions", () => {
      expect(isPairExpression("Hello World")).toBe(false);
    });

    it("should return that numbers are not pair expressions", () => {
      expect(isPairExpression(123)).toBe(false);
    });

    it("should return that negative numbers are not pair expressions", () => {
      expect(isPairExpression(-123)).toBe(false);
    });

    it("should return that numbers with decimals are not pair expressions", () => {
      expect(isPairExpression(123.45)).toBe(false);
    });

    it("should return that negative numbers with decimals are not pair expressions", () => {
      expect(isPairExpression(-123.45)).toBe(false);
    });

    it("should return that symbol references are not pair expressions", () => {
      expect(isPairExpression(Sym.of("Hello"))).toBe(false);
    });

    it("should return that empty arrays are not pair expressions", () => {
      const value: unknown[] = [];

      expect(isPairExpression(value)).toBe(false);
    });

    it("should return that common empty array reference is not pair expression", () => {
      const value = NullExpression;

      expect(isPairExpression(value)).toBe(false);
    });

    it("should return that filled arrays are pair expressions: 1 item", () => {
      const value = [1];

      expect(isPairExpression(value)).toBe(false);
    });

    it("should return that filled arrays are pair expressions: 2 items", () => {
      const value = [1, 2];

      expect(isPairExpression(value)).toBe(false);
    });

    it("should return that filled arrays are pair expressions: > 2 items", () => {
      const value = [1, 2, "World"];

      expect(isPairExpression(value)).toBe(false);
    });

    it("should return that objects are pair expressions", () => {
      const value = {};

      expect(isPairExpression(value)).toBe(false);
    });

    it("should return that booleans are not pair expressions: true", () => {
      expect(isPairExpression(true)).toBe(false);
    });

    it("should return that booleans are not pair expressions: false", () => {
      expect(isPairExpression(false)).toBe(false);
    });

    it("should return cells are a pair expression: atom car/cdr", () => {
      expect(isPairExpression(Cell.of(1, 1))).toBe(true);
    });

    it("should return cells are a pair expression: atom car, cell cdr", () => {
      const value = Cell.list(1, 2);
      expect(isPairExpression(value)).toBe(true);
    });

    it("should return procedure is list expression", () => {
      expect(
        isPairExpression(
          new Procedure(
            Cell.list(Sym.of("a")),
            Cell.list(Sym.of("a")),
            new Environment()
          )
        )
      ).toBe(false);
    });
  });
});
