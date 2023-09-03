import { StringTokenizer } from "./tokenizer";
import { Token } from "./token";

describe("StringTokenizer", () => {
  it("should tokenize empty string as EOF", () => {
    expect(tokenize("")).toStrictEqual([Token.Eof(0, 0)]);
  });

  it("should tokenize short quoted empty params", () => {
    expect(tokenize("'()")).toStrictEqual([
      Token.Quote(0, 0),
      Token.LeftBracket(0, 1),
      Token.RightBracket(0, 2),
      Token.Eof(0, 3),
    ]);
  });

  it("should tokenize empty params", () => {
    expect(tokenize("()")).toStrictEqual([
      Token.LeftBracket(0, 0),
      Token.RightBracket(0, 1),
      Token.Eof(0, 2),
    ]);
  });

  it("should tokenize list expressions", () => {
    expect(tokenize("(list 1 2 3)")).toStrictEqual([
      Token.LeftBracket(0, 0),
      Token.Symbol("list", 0, 1),
      Token.Number("1", 0, 6),
      Token.Number("2", 0, 8),
      Token.Number("3", 0, 10),
      Token.RightBracket(0, 11),
      Token.Eof(0, 12),
    ]);
  });

  it("should tokenize short quoted list expressions", () => {
    expect(tokenize("'(list 1 2 3)")).toStrictEqual([
      Token.Quote(0, 0),
      Token.LeftBracket(0, 1),
      Token.Symbol("list", 0, 2),
      Token.Number("1", 0, 7),
      Token.Number("2", 0, 9),
      Token.Number("3", 0, 11),
      Token.RightBracket(0, 12),
      Token.Eof(0, 13),
    ]);
  });

  it("should tokenize quote expressions", () => {
    expect(tokenize("(quote (list 1 2 3))")).toStrictEqual([
      Token.LeftBracket(0, 0),
      Token.Symbol("quote", 0, 1),
      Token.LeftBracket(0, 7),
      Token.Symbol("list", 0, 8),
      Token.Number("1", 0, 13),
      Token.Number("2", 0, 15),
      Token.Number("3", 0, 17),
      Token.RightBracket(0, 18),
      Token.RightBracket(0, 19),
      Token.Eof(0, 20),
    ]);
  });

  it("should tokenize short quoted quote expressions", () => {
    expect(tokenize("'(quote (list 1 2 3))")).toStrictEqual([
      Token.Quote(0, 0),
      Token.LeftBracket(0, 1),
      Token.Symbol("quote", 0, 2),
      Token.LeftBracket(0, 8),
      Token.Symbol("list", 0, 9),
      Token.Number("1", 0, 14),
      Token.Number("2", 0, 16),
      Token.Number("3", 0, 18),
      Token.RightBracket(0, 19),
      Token.RightBracket(0, 20),
      Token.Eof(0, 21),
    ]);
  });

  it("should tokenize if expressions and booleans", () => {
    expect(tokenize("(if #t #f #t)")).toStrictEqual([
      Token.LeftBracket(0, 0),
      Token.Symbol("if", 0, 1),
      Token.Boolean("#t", true, 0, 4),
      Token.Boolean("#f", false, 0, 7),
      Token.Boolean("#t", true, 0, 10),
      Token.RightBracket(0, 12),
      Token.Eof(0, 13),
    ]);
  });

  it("should tokenize short quoting a symbol", () => {
    expectInputReturns("'a", [
      Token.Quote(0, 0),
      Token.Symbol("a", 0, 1),
      Token.Eof(0, 2),
    ]);
  });

  it("should tokenize multiple short quotes on a symbol", () => {
    expectInputReturns("'''a", [
      Token.Quote(0, 0),
      Token.Quote(0, 1),
      Token.Quote(0, 2),
      Token.Symbol("a", 0, 3),
      Token.Eof(0, 4),
    ]);
  });

  it("should tokenize a string", () => {
    expectInputReturns('"Hello World"', [
      Token.String("Hello World", 0, 0),
      Token.Eof(0, 13),
    ]);
  });

  it("should tokenize a number", () => {
    expectInputReturns("123", [Token.Number("123", 0, 0), Token.Eof(0, 3)]);
  });

  it("should tokenize a negative number", () => {
    expectInputReturns("-123", [Token.Number("-123", 0, 0), Token.Eof(0, 4)]);
  });

  it("should tokenize a token substraction call expression", () => {
    expectInputReturns("(- 1 2)", [
      Token.LeftBracket(0, 0),
      Token.Symbol("-", 0, 1),
      Token.Number("1", 0, 3),
      Token.Number("2", 0, 5),
      Token.RightBracket(0, 6),
      Token.Eof(0, 7),
    ]);
  });

  it("should tokenize a token substraction addition expression", () => {
    expectInputReturns("(+ 1 2)", [
      Token.LeftBracket(0, 0),
      Token.Symbol("+", 0, 1),
      Token.Number("1", 0, 3),
      Token.Number("2", 0, 5),
      Token.RightBracket(0, 6),
      Token.Eof(0, 7),
    ]);
  });

  it("should tokenize a nested call expression", () => {
    expectInputReturns("(+ 1 (+ 1 1))", [
      Token.LeftBracket(0, 0),
      Token.Symbol("+", 0, 1),
      Token.Number("1", 0, 3),
      Token.LeftBracket(0, 5),
      Token.Symbol("+", 0, 6),
      Token.Number("1", 0, 8),
      Token.Number("1", 0, 10),
      Token.RightBracket(0, 11),
      Token.RightBracket(0, 12),
      Token.Eof(0, 13),
    ]);
  });

  it("should tokenize a float", () => {
    expectInputReturns("123.45", [
      Token.Number("123.45", 0, 0),
      Token.Eof(0, 6),
    ]);
  });

  it("should tokenize a negative float", () => {
    expectInputReturns("-123.45", [
      Token.Number("-123.45", 0, 0),
      Token.Eof(0, 7),
    ]);
  });

  it("should tokenize a symbol", () => {
    expectInputReturns("abcd", [Token.Symbol("abcd", 0, 0), Token.Eof(0, 4)]);
  });

  it("should throw with invalid character", () => {
    expect(() => tokenize("╝")).toThrowError(
      `A syntax error occurred (0, 0): Invalid character: ╝`
    );
  });

  it("should tokenize multiple expressions across multiple lines", () => {
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
      Token.Eof(2, 3),
    ]);
  });

  it("should tokenize call expression", () => {
    expectInputReturns("(+ 1 2)", [
      Token.LeftBracket(0, 0),
      Token.Symbol("+", 0, 1),
      Token.Number("1", 0, 3),
      Token.Number("2", 0, 5),
      Token.RightBracket(0, 6),
      Token.Eof(0, 7),
    ]);
  });

  it("should tokenize nested expressions", () => {
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
      Token.Eof(0, 13),
    ]);
  });

  it("should tokenize let expression", () => {
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
      Token.Eof(0, 44),
    ]);
  });
});

function tokenize(input: string): Token[] {
  const tokenizer = new StringTokenizer(input);
  const tokens = tokenizer.tokenize();

  return tokens;
}

function expectInputReturns(input: string, expectedOutput: Token[]) {
  const results = tokenize(input);
  expect(results).toStrictEqual(expectedOutput);
}
