import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Scanner", () => {
  describe("individual tokens", () => {
    it("should return token for left braket", () => {
      expectInputReturns("(", [Token.LeftBracket(0, 0), Token.Eof(1, 0)]);
    });

    it("should return token for right braket", () => {
      expectInputReturns(")", [Token.RightBracket(0, 0), Token.Eof(1, 0)]);
    });

    it("should return token for true boolean", () => {
      expectInputReturns("#t", [
        Token.Boolean("#t", true, 0, 0),
        Token.Eof(1, 0),
      ]);
    });

    it("should return token for false boolean", () => {
      expectInputReturns("#f", [
        Token.Boolean("#f", false, 0, 0),
        Token.Eof(1, 0),
      ]);
    });

    it("should return tokens for quoted expression", () => {
      expectInputReturns("'a", [
        Token.Quote(0, 0),
        Token.Symbol("a", 0, 1),
        Token.Eof(1, 0),
      ]);
    });

    it("should return tokens for multiple nested quoted expression", () => {
      expectInputReturns("'''a", [
        Token.Quote(0, 0),
        Token.Quote(0, 1),
        Token.Quote(0, 2),
        Token.Symbol("a", 0, 3),
        Token.Eof(1, 0),
      ]);
    });

    it("should return token for quoted string", () => {
      expectInputReturns('"Hello World"', [
        Token.String("Hello World", 0, 0),
        Token.Eof(1, 0),
      ]);
    });

    it("should return token for digits", () => {
      expectInputReturns("123", [Token.Number("123", 0, 0), Token.Eof(1, 0)]);
    });

    it("should return token for digits with dot", () => {
      expectInputReturns("123.45", [
        Token.Number("123.45", 0, 0),
        Token.Eof(1, 0),
      ]);
    });

    it("should return token for symbols", () => {
      expectInputReturns("abcd", [Token.Symbol("abcd", 0, 0), Token.Eof(1, 0)]);
    });

    it("should throw with invalid character", () => {
      expect(() => scanInput("╝")).toThrowError(
        `A syntax error occurred (0, 0): Invalid character: ╝`
      );
    });

    describe("composition", () => {
      it("should return correct line number for multi line input", () => {
        expectInputReturns(`(define a 1)\n(display a)\n123`, [
          Token.LeftBracket(0, 0),
          Token.Symbol("define", 0, 1),
          Token.Symbol("a", 0, 8),
          Token.Number("1", 0, 10),
          Token.RightBracket(0, 11),
          Token.LeftBracket(1, 0),
          Token.Symbol("display", 1, 1),
          Token.Symbol("a", 1, 9),
          Token.RightBracket(1, 10),
          Token.Number("123", 2, 0),
          Token.Eof(3, 0),
        ]);
      });

      it("should return multiple token types", () => {
        expectInputReturns("(+ 1 2)", [
          Token.LeftBracket(0, 0),
          Token.Symbol("+", 0, 1),
          Token.Number("1", 0, 3),
          Token.Number("2", 0, 5),
          Token.RightBracket(0, 6),
          Token.Eof(1, 0),
        ]);
      });

      it("should return token nested in brackets", () => {
        expectInputReturns("(- (+ 1 2) 3)", [
          Token.LeftBracket(0, 0),
          Token.Symbol("-", 0, 1),
          Token.LeftBracket(0, 3),
          Token.Symbol("+", 0, 4),
          Token.Number("1", 0, 6),
          Token.Number("2", 0, 8),
          Token.RightBracket(0, 9),
          Token.Number("3", 0, 11),
          Token.RightBracket(0, 12),
          Token.Eof(1, 0),
        ]);
      });

      it("should be a valid expression", () => {
        expectInputReturns("(let ((min 10)) (display min) (display max))", [
          Token.LeftBracket(0, 0),
          Token.Symbol("let", 0, 1),
          Token.LeftBracket(0, 5),
          Token.LeftBracket(0, 6),
          Token.Symbol("min", 0, 7),
          Token.Number("10", 0, 11),
          Token.RightBracket(0, 13),
          Token.RightBracket(0, 14),
          Token.LeftBracket(0, 16),
          Token.Symbol("display", 0, 17),
          Token.Symbol("min", 0, 25),
          Token.RightBracket(0, 28),
          Token.LeftBracket(0, 30),
          Token.Symbol("display", 0, 31),
          Token.Symbol("max", 0, 39),
          Token.RightBracket(0, 42),
          Token.RightBracket(0, 43),
          Token.Eof(1, 0),
        ]);
      });
    });
  });
});

function scanInput(input: string): Token[] {
  const scanner = new Scanner(input);
  const tokens = scanner.scan();

  return tokens;
}

function expectInputReturns(input: string, expectedOutput: Token[]) {
  const results = scanInput(input);
  expect(results).toStrictEqual(expectedOutput);
}
