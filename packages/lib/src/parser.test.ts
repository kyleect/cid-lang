import { Cell } from "./cell";
import { CIDLangSyntaxError } from "./errors";
import { NullExpression, PairExpression, Program } from "./expression";
import { Parser } from "./parser";
import { Sym } from "./symbol";
import { Tokenizer } from "./tokenizer";

describe("BaseParser", () => {
  it("should throw syntax error if source is empty", () => {
    expect(() => {
      parseStringToExpressions("");
    }).toThrow(new CIDLangSyntaxError(0, 0, "Unexpected EOF"));
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

    expect(expression).toStrictEqual([
      Cell.list(Sym.Quote, Cell.list(Sym.of("+"), 1, 2)),
    ]);

    expect((expression[0] as PairExpression).car).toBe(Sym.Quote);
  });

  it("should use the same common lambda symbol", () => {
    const expression = parseStringToExpressions("(lambda (a) a)");

    expect(expression).toStrictEqual([
      Cell.list(Sym.Lambda, Cell.list(Sym.of("a")), Sym.of("a")),
    ]);

    expect((expression[0] as PairExpression).car).toBe(Sym.Lambda);
  });

  it("should use the same common define symbol", () => {
    const expression = parseStringToExpressions("(define a 123)");

    expect(expression).toStrictEqual([Cell.list(Sym.Define, Sym.of("a"), 123)]);

    expect((expression[0] as PairExpression).car).toBe(Sym.Define);
  });

  it("should use the same common set symbol", () => {
    const expression = parseStringToExpressions("(set! a 123)");

    expect(expression).toStrictEqual([Cell.list(Sym.Set, Sym.of("a"), 123)]);

    expect((expression[0] as PairExpression).car).toBe(Sym.Set);
  });

  it("should parse quote expressions", () => {
    expect(parseStringToExpressions("(quote (+ 1 2))")).toStrictEqual([
      Cell.list(Sym.Quote, Cell.list(Sym.of("+"), 1, 2)),
    ]);
  });

  it("should parse short quote expressions: call expression", () => {
    expect(parseStringToExpressions("'(+ 1 2)")).toStrictEqual([
      Cell.list(Sym.Quote, Cell.list(Sym.of("+"), 1, 2)),
    ]);
  });

  it("should parse short quote expressions: number expression", () => {
    expect(parseStringToExpressions("'123")).toStrictEqual([
      Cell.list(Sym.Quote, 123),
    ]);
  });

  it("should parse short quote expressions: symbol expression", () => {
    expect(parseStringToExpressions("'a")).toStrictEqual([
      Cell.list(Sym.Quote, Sym.of("a")),
    ]);
  });

  it("should parse short quote expressions: string expression", () => {
    expect(parseStringToExpressions(`'"Hello World"`)).toStrictEqual([
      Cell.list(Sym.Quote, "Hello World"),
    ]);
  });

  it("should parse short quote expressions: list expression", () => {
    expect(parseStringToExpressions(`'(1 a "Hello")`)).toStrictEqual([
      Cell.list(Sym.Quote, Cell.list(1, Sym.of("a"), "Hello")),
    ]);
  });

  it("should parse short quote expressions: double quoted list expression", () => {
    expect(parseStringToExpressions(`''(1 a "Hello")`)).toStrictEqual([
      Cell.list(
        Sym.Quote,
        Cell.list(Sym.Quote, Cell.list(1, Sym.of("a"), "Hello"))
      ),
    ]);
  });

  it("should parse short quote expressions: boolean: true", () => {
    expect(parseStringToExpressions(`'#t`)).toStrictEqual([
      Cell.list(Sym.Quote, true),
    ]);
  });

  it("should parse short quote expressions: boolean: false", () => {
    expect(parseStringToExpressions(`'#f`)).toStrictEqual([
      Cell.list(Sym.Quote, false),
    ]);
  });

  it("should parse short quote expressions: if special form", () => {
    expect(parseStringToExpressions("'(if #t #f #t)")).toStrictEqual([
      Cell.list(Sym.Quote, Cell.list(Sym.If, true, false, true)),
    ]);
  });

  it("should parse short quote expressions: define special form", () => {
    expect(parseStringToExpressions("'(define a 100)")).toStrictEqual([
      Cell.list(Sym.Quote, Cell.list(Sym.Define, Sym.of("a"), 100)),
    ]);
  });

  it("should parse call expressions", () => {
    expect(parseStringToExpressions("(+ 1 2)")).toStrictEqual([
      Cell.list(Sym.of("+"), 1, 2),
    ]);
  });

  it("should multiple call expressions", () => {
    expect(parseStringToExpressions("(+ 1 2) 123")).toStrictEqual([
      Cell.list(Sym.of("+"), 1, 2),
      123,
    ]);
  });

  it("should parse nested call expressions", () => {
    expect(parseStringToExpressions("(+ 1 (+ 1 1))")).toStrictEqual([
      Cell.list(Sym.of("+"), 1, Cell.list(Sym.of("+"), 1, 1)),
    ]);
  });

  it("should parse deeply nested call expressions", () => {
    expect(parseStringToExpressions("(- (+ 1 (+ 1 1)) 1)")).toStrictEqual([
      Cell.list(
        Sym.of("-"),
        Cell.list(Sym.of("+"), 1, Cell.list(Sym.of("+"), 1, 1)),
        1
      ),
    ]);
  });

  it("should parse define expressions", () => {
    expect(parseStringToExpressions("(define a 123)")).toStrictEqual([
      Cell.list(Sym.Define, Sym.of("a"), 123),
    ]);
  });

  it("should parse define expressions", () => {
    expect(parseStringToExpressions("(set! a 123)")).toStrictEqual([
      Cell.list(Sym.Set, Sym.of("a"), 123),
    ]);
  });

  it("should parse define expressions then symbol expression", () => {
    expect(parseStringToExpressions("(define a 123) a")).toStrictEqual([
      Cell.list(Sym.Define, Sym.of("a"), 123),
      Sym.of("a"),
    ]);
  });

  it("should parse lambda expressions", () => {
    expect(parseStringToExpressions("(lambda (x) x)")).toStrictEqual([
      Cell.list(Sym.Lambda, Cell.list(Sym.of("x")), Sym.of("x")),
    ]);
  });

  it("should parse lambda expressions: no body", () => {
    expect(parseStringToExpressions("(lambda (x))")).toStrictEqual([
      Cell.list(Sym.Lambda, Cell.list(Sym.of("x"))),
    ]);
  });

  it("should parse if expressions: keyword", () => {
    expect(parseStringToExpressions("if")).toStrictEqual([Sym.If]);
  });

  it("should parse if expressions: symbol expression test", () => {
    expect(parseStringToExpressions("(if a #f #t)")).toStrictEqual([
      Cell.list(Sym.If, Sym.of("a"), false, true),
    ]);
  });

  it("should parse if expressions: call expression test", () => {
    expect(parseStringToExpressions("(if (a) #f #t)")).toStrictEqual([
      Cell.list(Sym.If, Cell.list(Sym.of("a")), false, true),
    ]);
  });

  it("should parse if expressions: no expression test", () => {
    expect(parseStringToExpressions("(if #f #t)")).toStrictEqual([
      Cell.list(Sym.If, false, true),
    ]);
  });

  it("should parse empty parans as the empty list expression", () => {
    const program = parseStringToExpressions("()");

    expect(program).toStrictEqual([[]]);
    expect(program[0]).toBe(NullExpression);
  });

  it("should parse empty parans as the empty list expression", () => {
    const program = parseStringToExpressions("(1)");

    expect(program).toStrictEqual([Cell.of(1, NullExpression)]);
  });

  it("should parse empty parans as the empty list expression", () => {
    const program = parseStringToExpressions("(1 2)");

    expect(program).toStrictEqual([Cell.of(1, Cell.of(2, NullExpression))]);
  });

  it("should parse empty parans as the empty list expression: two empty lists in a list", () => {
    const program = parseStringToExpressions("(() ())");

    expect(program).toStrictEqual([
      Cell.of(NullExpression, Cell.of(NullExpression, NullExpression)),
    ]);
  });

  it("should ignore comments", () => {
    expect(
      parseStringToExpressions(`
    ; Toggle
    (if #t #f #t) ; Flip
    `)
    ).toStrictEqual([Cell.list(Sym.If, true, false, true)]);
  });

  it("should parse defining a lambda then calling it", () => {
    const program = parseStringToExpressions(`
    (define id (lambda (x) x))(id 10)
    `);

    const $id = Sym.of("id");
    const $x = Sym.of("x");

    expect(program).toStrictEqual([
      Cell.list(Sym.Define, $id, Cell.list(Sym.Lambda, Cell.list($x), $x)),
      Cell.list($id, 10),
    ]);
  });

  it("should parse begin expressions: no expression test", () => {
    expect(parseStringToExpressions("(begin)")).toStrictEqual([
      Cell.list(Sym.Begin),
    ]);
  });

  it("should parse begin expressions: one expression test", () => {
    expect(parseStringToExpressions("(begin 123)")).toStrictEqual([
      Cell.list(Sym.Begin, 123),
    ]);
  });

  it("should parse begin expressions: multiple expressions test", () => {
    expect(
      parseStringToExpressions("(begin (set! x 100) (* 5 x))")
    ).toStrictEqual([
      Cell.list(
        Sym.Begin,
        Cell.list(Sym.Set, Sym.of("x"), 100),
        Cell.list(Sym.of("*"), 5, Sym.of("x"))
      ),
    ]);
  });

  it("should parse string-append expresion", () => {
    expect(
      parseStringToExpressions(`(string-append "Hello" 'World)`)
    ).toStrictEqual([
      Cell.list(
        Sym.of("string-append"),
        "Hello",
        Cell.list(Sym.Quote, Sym.of("World"))
      ),
    ]);
  });

  it.skip("should parse string-join expresion: empty join", () => {
    expect(
      parseStringToExpressions(`(string-join ("Hello" 'World) "")`)
    ).toStrictEqual([
      Cell.list(
        Sym.of("string-join"),
        Cell.list("Hello", Cell.list(Sym.Quote, Sym.of("World"))),
        ""
      ),
    ]);
  });

  it("should let expresion", () => {
    expect(
      parseStringToExpressions(`
      (let ((a 10) (b 15)) (+ a b))
      `)
    ).toStrictEqual([
      Cell.list(
        Sym.Let,
        Cell.list(Cell.list(Sym.of("a"), 10), Cell.list(Sym.of("b"), 15)),
        Cell.list(Sym.of("+"), Sym.of("a"), Sym.of("b"))
      ),
    ]);
  });
});

function parseStringToExpressions(source: string): Program {
  const tokenizer = Tokenizer.String(source);
  const tokens = tokenizer.tokenize();

  const parser = Parser.Token(tokens);
  const expressions = parser.parse();

  return expressions;
}
