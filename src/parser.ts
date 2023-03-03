import { Token, TokenType } from "./token";

export class Expr {
  static Call(callee, args): CallExpr {
    return new CallExpr(callee, args);
  }

  static Symbol(token: Token): SymbolExpr {
    return new SymbolExpr(token);
  }

  static Literal(value: unknown): LiteralExpr {
    return new LiteralExpr(value);
  }

  static If(test, consequent, alternative): IfExpr {
    return new IfExpr(test, consequent, alternative);
  }

  static IsCall(expression: Expr): expression is CallExpr {
    return expression instanceof CallExpr;
  }

  static IsSymbol(expression: Expr): expression is SymbolExpr {
    return expression instanceof SymbolExpr;
  }

  static IsLiteral(expression: Expr): expression is LiteralExpr {
    return expression instanceof LiteralExpr;
  }

  static IsIf(expression: Expr): expression is IfExpr {
    return expression instanceof IfExpr;
  }
}

class CallExpr extends Expr {
  constructor(public callee, public args) {
    super();
  }
}

class SymbolExpr extends Expr {
  constructor(public token: Token) {
    super();
  }
}

class LiteralExpr extends Expr {
  constructor(public value: unknown) {
    super();
  }
}

class IfExpr extends Expr {
  constructor(public test, public consequent, public alternative) {
    super();
  }
}

export class Parser {
  static NULL_VALUE = [];

  private current = 0;

  constructor(private tokens: Token[]) {}

  public parse(): Expr[] {
    const expressions = [];
    while (!this.isAtEnd()) {
      const expr = this.expression();
      expressions.push(expr);
    }
    return expressions;
  }

  private isAtEnd(): boolean {
    return this.peek().getTokenType() === TokenType.Eof;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private expression() {
    if (this.match(TokenType.LeftBracket)) {
      if (this.match(TokenType.RightBracket)) {
        return Expr.Literal(Parser.NULL_VALUE);
      }

      const token = this.peek();
      if (token.getLexeme() === "if") return this.if();
      return this.call();
    }
    return this.atom();
  }

  private match(tokenType): boolean {
    if (this.check(tokenType)) {
      this.current++;
      return true;
    }
    return false;
  }

  private check(tokenType): boolean {
    return this.peek().getTokenType() === tokenType;
  }

  private call() {
    const callee = this.expression();
    const args = [];
    while (!this.match(TokenType.RightBracket)) {
      args.push(this.expression());
    }
    return Expr.Call(callee, args);
  }

  private if(): IfExpr {
    this.advance(); // move past the "if" token
    const test = this.expression();
    const consequent = this.expression();
    let alternative;
    if (!this.match(TokenType.RightBracket)) {
      alternative = this.expression();
    }
    this.consume(TokenType.RightBracket);
    return Expr.If(test, consequent, alternative);
  }

  private consume(tokenType) {
    if (this.check(tokenType)) {
      return this.advance();
    }
    throw new SyntaxError(
      `Unexpected token ${this.previous().getTokenType()}, expected ${tokenType}`
    );
  }

  private previous() {
    return this.tokens[this.current - 1];
  }

  private atom(): SymbolExpr | LiteralExpr {
    switch (true) {
      case this.match(TokenType.Symbol):
        return Expr.Symbol(this.previous());
      case this.match(TokenType.Number):
      case this.match(TokenType.String):
      case this.match(TokenType.Boolean):
        return Expr.Literal(this.previous().getLiteral());
      default:
        throw new SyntaxError(
          `Unexpected token: ${this.peek().getTokenType()}`
        );
    }
  }

  private advance(): Token {
    return this.tokens[this.current++];
  }
}
