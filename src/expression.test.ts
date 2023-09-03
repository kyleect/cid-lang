import { Environment } from "./env";
import { isAtomicExpression, isListExpression } from "./expression";
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

    it("should return that empty arrays are list expressions", () => {
      expect(isListExpression([])).toBe(true);
    });

    it("should return that filled arrays are list expressions", () => {
      expect(isListExpression([1, 2, "World"])).toBe(true);
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
          new Procedure([Sym.of("a")], Sym.of("a"), new Environment())
        )
      ).toBe(true);
    });
  });
});
