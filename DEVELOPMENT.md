# Development

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
type AtomicExpression = number | string | Sym | boolean;
type ListExpression = (AtomicExpression | ListExpression)[];
type Expression = AtomicExpression | ListExpression;
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
