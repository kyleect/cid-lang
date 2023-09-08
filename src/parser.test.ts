import { SchemeTSSyntaxError } from "./exceptions";
import { EmptyListExpression, Expression } from "./expression";
import { Parser } from "./parser";
import { Sym } from "./symbol";
import { Tokenizer } from "./tokenizer";

describe("BaseParser", () => {
  it("should throw syntax error if source is empty", () => {
    expect(() => {
      parseStringToExpressions("");
    }).toThrow(new SchemeTSSyntaxError(0, 0, "Unexpected EOF"));
  });

  it("should parse number expressions", () => {
    expect(parseStringToExpressions("123")).toStrictEqual([123]);
  });

  it("should parse negative number expressions", () => {
    expect(parseStringToExpressions("-123")).toStrictEqual([-123]);
  });

  it("should parse float expressions", () => {
    expect(parseStringToExpressions("123.45")).toStrictEqual([123.45]);
  });

  it("should parse negative float expressions", () => {
    expect(parseStringToExpressions("-123.45")).toStrictEqual([-123.45]);
  });

  it("should parse string expressions", () => {
    expect(parseStringToExpressions('"Hello World"')).toStrictEqual([
      "Hello World",
    ]);
  });

  it("should parse boolean expressions: true", () => {
    expect(parseStringToExpressions("#t")).toStrictEqual([true]);
  });

  it("should parse boolean expressions: false", () => {
    expect(parseStringToExpressions("#f")).toStrictEqual([false]);
  });

  it("should use the same common quote symbol", () => {
    const expression = parseStringToExpressions("(quote (+ 1 2))");

    expect(expression).toHaveLength(1);

    expect(expression[0]).toHaveLength(2);

    expect(expression[0][0]).toBe(Sym.Quote);
  });

  it("should use the same common lambda symbol", () => {
    const expression = parseStringToExpressions("(lambda (a) a)");

    expect(expression).toHaveLength(1);

    expect(expression[0]).toHaveLength(3);

    expect(expression[0][0]).toBe(Sym.Lambda);
  });

  it("should use the same common define symbol", () => {
    const expression = parseStringToExpressions("(define a 123)");

    expect(expression).toHaveLength(1);

    expect(expression[0]).toHaveLength(3);

    expect(expression[0][0]).toBe(Sym.Define);
  });

  it("should use the same common set symbol", () => {
    const expression = parseStringToExpressions("(set! a 123)");

    expect(expression).toHaveLength(1);

    expect(expression[0]).toHaveLength(3);

    expect(expression[0][0]).toBe(Sym.Set);
  });

  it("should parse quote expressions", () => {
    expect(parseStringToExpressions("(quote (+ 1 2))")).toStrictEqual([
      [Sym.Quote, [Sym.of("+"), 1, 2]],
    ]);
  });

  it("should parse short quote expressions: call expression", () => {
    expect(parseStringToExpressions("'(+ 1 2)")).toStrictEqual([
      [Sym.Quote, [Sym.of("+"), 1, 2]],
    ]);
  });

  it("should parse short quote expressions: number expression", () => {
    expect(parseStringToExpressions("'123")).toStrictEqual([[Sym.Quote, 123]]);
  });

  it("should parse short quote expressions: symbol expression", () => {
    expect(parseStringToExpressions("'a")).toStrictEqual([
      [Sym.Quote, Sym.of("a")],
    ]);
  });

  it("should parse short quote expressions: string expression", () => {
    expect(parseStringToExpressions(`'"Hello World"`)).toStrictEqual([
      [Sym.Quote, "Hello World"],
    ]);
  });

  it("should parse short quote expressions: list expression", () => {
    expect(parseStringToExpressions(`'(1 a "Hello")`)).toStrictEqual([
      [Sym.Quote, [1, Sym.of("a"), "Hello"]],
    ]);
  });

  it("should parse short quote expressions: double quoted list expression", () => {
    expect(parseStringToExpressions(`''(1 a "Hello")`)).toStrictEqual([
      [Sym.Quote, [Sym.Quote, [1, Sym.of("a"), "Hello"]]],
    ]);
  });

  it("should parse short quote expressions: boolean: true", () => {
    expect(parseStringToExpressions(`'#t`)).toStrictEqual([[Sym.Quote, true]]);
  });

  it("should parse short quote expressions: boolean: false", () => {
    expect(parseStringToExpressions(`'#f`)).toStrictEqual([[Sym.Quote, false]]);
  });

  it("should parse short quote expressions: if special form", () => {
    expect(parseStringToExpressions("'(if #t #f #t)")).toStrictEqual([
      [Sym.Quote, [Sym.If, true, false, true]],
    ]);
  });

  it("should parse short quote expressions: define special form", () => {
    expect(parseStringToExpressions("'(define a 100)")).toStrictEqual([
      [Sym.Quote, [Sym.Define, Sym.of("a"), 100]],
    ]);
  });

  it("should parse call expressions", () => {
    expect(parseStringToExpressions("(+ 1 2)")).toStrictEqual([
      [Sym.of("+"), 1, 2],
    ]);
  });

  it("should multiple call expressions", () => {
    expect(parseStringToExpressions("(+ 1 2) 123")).toStrictEqual([
      [Sym.of("+"), 1, 2],
      123,
    ]);
  });

  it("should parse nested call expressions", () => {
    expect(parseStringToExpressions("(+ 1 (+ 1 1))")).toStrictEqual([
      [Sym.of("+"), 1, [Sym.of("+"), 1, 1]],
    ]);
  });

  it("should parse deeply nested call expressions", () => {
    expect(parseStringToExpressions("(- (+ 1 (+ 1 1)) 1)")).toStrictEqual([
      [Sym.of("-"), [Sym.of("+"), 1, [Sym.of("+"), 1, 1]], 1],
    ]);
  });

  it("should parse define expressions", () => {
    expect(parseStringToExpressions("(define a 123)")).toStrictEqual([
      [Sym.Define, Sym.of("a"), 123],
    ]);
  });

  it("should parse define expressions", () => {
    expect(parseStringToExpressions("(set! a 123)")).toStrictEqual([
      [Sym.Set, Sym.of("a"), 123],
    ]);
  });

  it("should parse define expressions then symbol expression", () => {
    expect(parseStringToExpressions("(define a 123) a")).toStrictEqual([
      [Sym.Define, Sym.of("a"), 123],
      Sym.of("a"),
    ]);
  });

  it("should parse lambda expressions", () => {
    expect(parseStringToExpressions("(lambda (x) x)")).toStrictEqual([
      [Sym.Lambda, [Sym.of("x")], Sym.of("x")],
    ]);
  });

  it("should parse lambda expressions: no body", () => {
    expect(parseStringToExpressions("(lambda (x))")).toStrictEqual([
      [Sym.Lambda, [Sym.of("x")]],
    ]);
  });

  it("should parse if expressions: keyword", () => {
    expect(parseStringToExpressions("if")).toStrictEqual([Sym.If]);
  });

  it("should parse if expressions: symbol expression test", () => {
    expect(parseStringToExpressions("(if a #f #t)")).toStrictEqual([
      [Sym.If, Sym.of("a"), false, true],
    ]);
  });

  it("should parse if expressions: call expression test", () => {
    expect(parseStringToExpressions("(if (a) #f #t)")).toStrictEqual([
      [Sym.If, [Sym.of("a")], false, true],
    ]);
  });

  it("should parse if expressions: no expression test", () => {
    expect(parseStringToExpressions("(if #f #t)")).toStrictEqual([
      [Sym.If, false, true],
    ]);
  });

  it("should parse empty parans as the empty list expression", () => {
    const result = parseStringToExpressions("()");

    expect(Object.is(result[0], EmptyListExpression)).toBe(true);
  });

  it("should ignore comments", () => {
    expect(
      parseStringToExpressions(`
    ; Toggle
    (if #t #f #t) ; Flip
    `)
    ).toStrictEqual([[Sym.If, true, false, true]]);
  });
});

function parseStringToExpressions(source: string): Expression {
  const tokenizer = Tokenizer.String(source);
  const tokens = tokenizer.tokenize();

  const parser = Parser.Token(tokens);
  const expressions = parser.parse();

  return expressions;
}
