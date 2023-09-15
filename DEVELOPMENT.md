# Development

## Building

- `npm run build` Runs `npx turbo build-src build-bins`

## Tests

- `npx turbo test` Runs all tests
- `npx turbo coverage` Runs all tests with coverage

## Formatting/Linting

- `npx turbo typecheck` Typecheck code
- `npx turbo lint` Runs eslint
- `npx turbo format` Format code with prettier
- `npm run verify` Runs `npx turbo typecheck test lint`

## Running

- `npm run cli` Runs `apps/cidlang/dist/lib/cidlang.js`. Must run `npm run build` first.
- `npm run repl` Runs `apps/cidrepl/dist/lib/cidrepl.js`. Must run `npm run build` first.
- `apps/cidlang/dist/bins/cidlang-{linux|macos|windows.exe}` Runs cidlang binary. Must run `npm run build` first.
- `apps/cidrepl/dist/bins/cidrepl-{linux|macos|windows.exe}` Runs cidrepl binary. Must run `npm run build` first.

## Navigating

1. [Tokenize](#tokenizer) source code in to [tokens](#tokens)
2. [Parse](#parser) tokens in to [expressions](#expressions)
3. [Interpret](#interpreter) expressions

## Domain

### Tokens

Tokens are mappings of syntax value from the source code. They have a `tokenType`, `lexeme` and `literal` values. The `tokenType` is the type of syntax the token represents. The `lexeme` is the raw string from the source code while `literal` is the literal value the `lexeme` represents.

The `Tokenizer` will take an input string of source code and return `Token[]` for the `Parser`.

```typescript
class Token {
  private readonly tokenType: TokenType;
  private readonly lexeme: string;
  private readonly literal: unknown;
}

enum TokenType {
  LeftBracket = "LeftBracket",
  RightBracket = "RightBracket",
  Quote = "Quote",
  Symbol = "Symbol",
  Number = "Number",
  Boolean = "Boolean",
  String = "String",
  Eof = "Eof",
}
```

### Expressions

The `Parser` will take an input `Token[]` and generate expressions `Expression[]` for the `Interpreter`.

```typescript
export type NumericExpression = number;
export type StringExpression = string;
export type BooleanExpression = boolean;
export type SymbolExpression = Sym;

/**
 * Single value, non list expressions
 *
 * - 123
 * - "Hello World"
 * - Sym.of("a")
 * - true/false
 */
type AtomicExpression =
  | NumericExpression
  | StringExpression
  | SymbolExpression
  | BooleanExpression;

/**
 * Tuple/pair value expression
 *
 * - Cell.of(1, 2) => (1 . 2)
 * - Cell.list(1, 2) => (1 . (2 . ())) => (1 2)
 */
type PairExpression = Cell;

/**
 * Null/empty list expression
 *
 * - ()
 * - '()
 * - (list)
 * - Cell.list()
 */
type NullExpression = [];

/**
 * Pair or empty list expression
 *
 * () '() (1 . 2) (1 2 3) (list 1 2 3)
 */
type ListExpression = PairExpression | NullExpression;

/**
 * Atomic or list expression
 */
type Expression = AtomicExpression | ListExpression;

/**
 * One or more expressions
 */
type Program = Expression[];
```

## Implementation

### Tokenizer

[Code](src/tokenizer.ts)

The `Tokenizer` reads in a source code string and returns `Token[]`.

### Parser

[Code](src/parser.ts)

The `Parser` reads in a `Token[]` and returns `Exression[]`.

### Interpreter

[Code](src/interpreter.ts)

The `Interpreter` reads in and executes an `Exression[]` returning the result of the last `Exression`.
