import { Cell } from "./cell";
import { CIDLangRuntimeError } from "./errors";
import { EmptyListExpression, ListExpression } from "./expression";

describe("Cell", () => {
  describe("of", () => {
    it("should throw if car is null", () => {
      expect(() => Cell.of(null, EmptyListExpression)).toThrow(
        new CIDLangRuntimeError(`Illegal car expression: null`)
      );
    });

    it("should throw if cdr is null", () => {
      expect(() => Cell.of(1, null)).toThrow(
        new CIDLangRuntimeError(`Illegal cdr expression: null`)
      );
    });
  });

  describe("makeList", () => {
    let list: ListExpression;

    describe("populated list", () => {
      beforeEach(() => {
        list = Cell.list(1, 2, 3);
      });

      it("should have correct length", () => {
        expect(list).toHaveLength(3);
      });

      it("should be made up of linked cells", () => {
        expect(list).toStrictEqual(
          Cell.of(1, Cell.of(2, Cell.of(3, EmptyListExpression)))
        );
      });

      it("should iterate in to an array: rest", () => {
        expect([...list]).toStrictEqual([1, 2, 3]);
      });

      it("should iterate in to an array: Array.from", () => {
        expect(Array.from(list)).toStrictEqual([1, 2, 3]);
      });
    });

    describe("empty list", () => {
      beforeEach(() => {
        list = Cell.list();
      });

      it("should return common empty list reference", () => {
        expect(list).toBe(EmptyListExpression);
      });
    });

    describe("single item list", () => {
      beforeEach(() => {
        list = Cell.list(1);
      });

      it("should return common empty list reference", () => {
        expect(list).toStrictEqual(Cell.of(1, EmptyListExpression));
      });

      it("should iterate in to an array: rest", () => {
        expect([...list]).toStrictEqual([1]);
      });

      it("should iterate in to an array: Array.from", () => {
        expect(Array.from(list)).toStrictEqual([1]);
      });
    });
  });
});
