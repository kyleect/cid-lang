# Development

## Building

- `npx turbo build-src` Builds the project in to `dist/lib`
- `npx turbo build-bins` Builds the `cidlang.js` & `cidrepl.js` files in `dist/bins` in to executable binaries
  - `dist/bins/cidlang-{linux|macos|windows.exe}`
  - `dist/bins/cidrepl-{linux|macos|windows.exe}`
- `npm run build-docker` Builds the [Dockerfile](./Dockerfile) in to the image `cidlang`
- `npm run docs` Builds the documentation files in to `docs/`
- `npm run build` Runs `npx turbo build-src build-bins`

## Tests

- `npx turbo test` Runs all tests
- `npx turbo coverage` Runs all tests with coverage
- `npm run test:watch` Run tests and watch for changes

## Formatting/Linting

- `npm run typecheck` Typecheck code in `src`
- `npx turbo lint` Runs eslint
- `npm run format` Format code with prettier
- `npm run verify` Runs `npx turbo typecheck test lint`

## Running

- `npm run cli` Runs `dist/lib/cidlang.js`. Must run `npx turbo build-src` first.
- `npm run repl` Runs `dist/lib/cidrepl.js`. Must run `npx turbo build-src` first.
- `dist/bins/cidlang-{linux|macos|windows.exe}` Runs cidlang binary. Must run `npx turbo build-src build-bins` first.
- `dist/bins/cidrepl-{linux|macos|windows.exe}` Runs cidrepl binary. Must run `npx turbo build-src build-bins` first.
- `npm run cli-docker` Runs `cidlang` inside a docker container. Must run `npm run build-docker` first.
- `npm run repl-docker` Runs `cidrepl` inside a docker container. Must run `npm run build-docker` first.

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

The `Parser` will take an input `Token[]` and generate expressions `Expr[]` for the `Interpreter`.

```typescript
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
  | Sym
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
