# Development

## Navigating

1. [Scan](#scanner) source code for tokens
2. [Parse](#parser) tokens in to expressions
3. [Interpret](#interpreter) and execute expressions

## Domain

### Source Code

The input string representing the soure code of the application. See: https://www.scheme.org/

### Tokens

Tokens are mappings of syntax value from the source code. They have a `tokenType`, `lexeme` and `literal` values. The `tokenType` is the type of syntax the token represents. The `lexeme` is the raw string from the source code while `literal` is the literal value the `lexeme` represents.

The `Scanner` will take an input string of source code and return `Token[]` for the `Parser`.

```typescript
class Token {
  private readonly tokenType: TokenType;
  private readonly lexeme: string;
  private readonly literal: unknown;
}

enum TokenType {
  LeftBracket,
  RightBracket,
  Symbol,
  Number,
  Boolean,
  String,
  Eof,
}
```

### Expressions

The `Parser` will take an input `Token[]` and generate expressions `Expr[]` for the `Interpreter`.

## Implementation

### Scanner

[Code](src/scanner.ts)

The `Scanner` reads in a source code string and returns `Token[]`.

### Parser

[Code](src/parser.ts)

The `Parser` reads in a `Token[]` and returns `Expr[]`.

### Interpreter

[Code](src/interpreter.ts)

The `Interpreter` reads in and executes an `Expr[]` returning the result of the last `Expr`.
