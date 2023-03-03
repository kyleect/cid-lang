import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Scanner", () => {
  describe("individual tokens", () => {
    it("should return token for left braket", () => {
      const scanner = new Scanner("(");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([Token.LeftBracket(), Token.Eof()]);
    });

    it("should return token for right braket", () => {
      const scanner = new Scanner(")");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([Token.RightBracket(), Token.Eof()]);
    });

    it("should return token for true boolean", () => {
      const scanner = new Scanner("#t");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([Token.Boolean("#t", true), Token.Eof()]);
    });

    it("should return token for true boolean", () => {
      const scanner = new Scanner("#f");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([Token.Boolean("#f", false), Token.Eof()]);
    });

    it("should return token for quoted string", () => {
      const scanner = new Scanner('"Hello World"');
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([
        Token.String('"Hello World', "Hello World"),
        Token.Eof(),
      ]);
    });

    it("should return token for digits", () => {
      const scanner = new Scanner("123");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([Token.Number("123", 123), Token.Eof()]);
    });

    it("should return token for digits with dot", () => {
      const scanner = new Scanner("123.45");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([
        Token.Number("123.45", 123.45),
        Token.Eof(),
      ]);
    });

    it("should return token for digits with dot", () => {
      const scanner = new Scanner("abcd");
      const tokens = scanner.scan();

      expect(tokens).toStrictEqual([Token.Symbol("abcd"), Token.Eof()]);
    });

    it("should return token for digits with dot", () => {
      const scanner = new Scanner("╝");

      expect(() => {
        scanner.scan();
      }).toThrowError(`Unknown token: ╝`);
    });
  });

  describe("composition", () => {
    it("should return multiple token types", () => {
      const tokens = new Scanner("(+ 1 2)").scan();

      expect(tokens).toStrictEqual([
        Token.LeftBracket(),
        Token.Symbol("+"),
        Token.Number("1", 1),
        Token.Number("2", 2),
        Token.RightBracket(),
        Token.Eof(),
      ]);
    });

    it("should return token nested in brackets", () => {
      const tokens = new Scanner("(- (+ 1 2) 3)").scan();

      expect(tokens).toStrictEqual([
        Token.LeftBracket(),
        Token.Symbol("-"),
        Token.LeftBracket(),
        Token.Symbol("+"),
        Token.Number("1", 1),
        Token.Number("2", 2),
        Token.RightBracket(),
        Token.Number("3", 3),
        Token.RightBracket(),
        Token.Eof(),
      ]);
    });
  });
});
