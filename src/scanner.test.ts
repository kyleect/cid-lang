import { Scanner } from "./scanner";
import { Token } from "./token";

describe("Scanner", () => {
  describe("individual tokens", () => {
    it("should return token for left braket", () => {
      expectInputReturns("(", [
        Token.LeftBracket(),
        Token.Eof()
      ]);
    });

    it("should return token for right braket", () => {
      expectInputReturns(")", [
        Token.RightBracket(),
        Token.Eof()
      ]);
    });

    it("should return token for true boolean", () => {
      expectInputReturns("#t", [
        Token.Boolean("#t", true),
        Token.Eof()
      ]);
    });

    it("should return token for false boolean", () => {
      expectInputReturns("#f", [
        Token.Boolean("#f", false),
        Token.Eof()
      ]);
    });

    it("should return token for quoted string", () => {
      expectInputReturns('"Hello World"', [
        Token.String('"Hello World', "Hello World"),
        Token.Eof(),
      ]);
    });

    it("should return token for digits", () => {
      expectInputReturns("123", [
        Token.Number("123", 123),
        Token.Eof()
      ]);
    });

    it("should return token for negative digits", () => {
      expectInputReturns("-123", [
        Token.Number("-123", -123),
        Token.Eof()
      ]);
    });

    it("should return token for digits with dot", () => {
      expectInputReturns("123.45", [
        Token.Number("123.45", 123.45),
        Token.Eof(),
      ]);
    });

    it("should return token for symbols", () => {
      expectInputReturns("abcd", [
        Token.Symbol("abcd"),
        Token.Eof()
      ]);
    });

    it("should throw with unknown token", () => {
      expect(() => scanInput("╝")).toThrowError(`Unknown token: ╝`);
    });
  });

  describe("composition", () => {
    it("should return multiple token types", () => {
      expectInputReturns("(+ 1 2)", [
        Token.LeftBracket(),
        Token.Symbol("+"),
        Token.Number("1", 1),
        Token.Number("2", 2),
        Token.RightBracket(),
        Token.Eof(),
      ]);
    });

    it("should return token nested in brackets", () => {
      expectInputReturns("(- (+ 1 2) 3)", [
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

function scanInput(input: string): Token[] {
  const scanner = new Scanner(input);
  const tokens = scanner.scan();

  return tokens;
}

function expectInputReturns(input: string, expectedOutput: Token[]) {
  expect(scanInput(input)).toStrictEqual(expectedOutput);
}