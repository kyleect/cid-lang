import { Token, TokenType } from "./token";

export class Expr {
  toString(): string {
    return `<Expr>`;
  }

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

  static Define(token: Token, value: unknown): DefineExpr {
    return new DefineExpr(token, value);
  }

  static Set(token: Token, value: unknown): SetExpr {
    return new SetExpr(token, value);
  }

  static Let(bindings: LetBindingNode[], body: Expr[]): LetExpr {
    return new LetExpr(bindings, body);
  }

  static Lambda(params: Token[], body: Expr[]): LambdaExpr {
    return new LambdaExpr(params, body);
  }

  static Quote(value: Expr): QuoteExpr {
    return new QuoteExpr(value);
  }

  static IsExpr(expression: Expr): expression is Expr {
    return expression instanceof Expr;
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

  static isDefine(expression: Expr): expression is DefineExpr {
    return expression instanceof DefineExpr;
  }

  static isSet(expression: Expr): expression is SetExpr {
    return expression instanceof SetExpr;
  }

  static isLet(expression: Expr): expression is LetExpr {
    return expression instanceof LetExpr;
  }

  static isLambda(expression: Expr): expression is LambdaExpr {
    return expression instanceof LambdaExpr;
  }

  static isQuote(expression: Expr): expression is QuoteExpr {
    return expression instanceof QuoteExpr;
  }
}

class CallExpr extends Expr {
  constructor(public callee: Expr, public args: unknown[]) {
    super();
  }

  toString(): string {
    const args = this.args.join(" ");

    return `(${this.callee}${args.length ? ` ${this.args.join(" ")}` : ""})`;
  }
}

class SymbolExpr extends Expr {
  constructor(public token: Token) {
    super();
  }

  toString(): string {
    return this.token.getLexeme();
  }
}

class LiteralExpr extends Expr {
  constructor(public value: unknown) {
    super();
  }

  toString(): string {
    if (Array.isArray(this.value)) {
      return `(${this.value.join(" ")})`;
    }
    return `${this.value}`;
  }
}

class IfExpr extends Expr {
  constructor(public test, public consequent, public alternative) {
    super();
  }
}

class DefineExpr extends Expr {
  constructor(public token: Token, public value: unknown) {
    super();
  }

  toString(): string {
    return `(define ${this.token.getLexeme()} ${this.value})`;
  }
}

class SetExpr extends Expr {
  constructor(public token: Token, public value: unknown) {
    super();
  }

  toString(): string {
    return `(set! ${this.token.getLexeme()} ${this.value})`;
  }
}

class LetExpr extends Expr {
  constructor(public bindings: LetBindingNode[], public body: Expr[]) {
    super();
  }

  toString(): string {
    return `(let (${this.bindings.join(" ")}) ${this.body.join(" ")})`;
  }

  bindingsToMap(): ReturnType<Map<string, unknown>["entries"]> {
    return new Map(
      this.bindings.map((binding) => {
        return [binding.name.getLexeme(), binding.value];
      })
    ).entries();
  }
}

export class LetBindingNode {
  constructor(public name: Token, public value: Expr) {}

  toString(): string {
    return `(${this.name.getLexeme()} ${this.value})`;
  }
}

export class LambdaExpr extends Expr {
  constructor(public params: Token[], public body: Expr[]) {
    super();
  }

  toString(): string {
    return `(lambda (${this.params
      .map((token) => token.getLexeme())
      .join(" ")}) ${this.body.join(" ")})`;
  }
}

export class QuoteExpr extends Expr {
  constructor(public value: Expr) {
    super();
  }

  toString(): string {
    if (Expr.isQuote(this.value)) {
      return `'${this.value}`;
    }

    return this.value.toString();
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

  /**
   * Returns the current token
   * @returns Current token
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Return the next token
   * @returns Next token
   */
  private peekNext(): Token {
    return this.tokens[this.current + 1];
  }

  private expression(): Expr {
    if (this.match(TokenType.Quote)) {
      return this.shortquote();
    }

    if (this.match(TokenType.LeftBracket)) {
      if (this.match(TokenType.RightBracket)) {
        return Expr.Literal(Parser.NULL_VALUE);
      }

      if (
        this.match(TokenType.Number) ||
        this.match(TokenType.String) ||
        this.match(TokenType.Boolean)
      ) {
        const values = [];

        while (
          (!this.match(TokenType.RightBracket) &&
            this.match(TokenType.Number)) ||
          this.match(TokenType.String) ||
          this.match(TokenType.Boolean)
        ) {
          values.push(this.expression());
        }

        return Expr.Literal(values);
      }

      const token = this.peek();
      if (token.getLexeme() === "if") return this.if();
      if (token.getLexeme() === "define") return this.define();
      if (token.getLexeme() === "set!") return this.set();
      if (token.getLexeme() === "let") return this.let();
      if (token.getLexeme() === "lambda") return this.lambda();
      if (token.getLexeme() === "quote") return this.quote();
      return this.call();
    }

    return this.atom();
  }

  /**
   * Move to the next token if current token is of the expected token type
   * @param {TokenType} tokenType The token type to check for
   * @returns {boolean} Result of the check
   */
  private match(tokenType: TokenType): boolean {
    if (this.check(tokenType)) {
      this.current++;
      return true;
    }
    return false;
  }

  /**
   * Check if the current token is of the expected token type
   * @param {TokenType} tokenType The token type to check for
   * @returns {boolean} Result of the check
   */
  private check(tokenType: TokenType): boolean {
    return this.peek().getTokenType() === tokenType;
  }

  /**
   * Check if the next token is of the expected token type
   * @param {TokenType} tokenType The token type to check for
   * @returns {boolean} Result of the check
   */
  private checkNext(tokenType: TokenType): boolean {
    return this.peekNext().getTokenType() === tokenType;
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

  /**
   * Move to and return next token if the current token matches expected token type
   * @param tokenType
   * @returns {Token}
   */
  private consume(tokenType: TokenType): Token {
    if (this.check(tokenType)) {
      return this.advance();
    }
    throw new SyntaxError(
      `Unexpected token ${this.previous().getTokenType()}, expected ${tokenType}`
    );
  }

  /**
   * Get the previous token
   * @returns {Token} The previous token
   */
  private previous(): Token {
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

  /**
   * Move to and return the next token
   * @returns The next token
   */
  private advance(): Token {
    return this.tokens[this.current++];
  }

  private define(): DefineExpr {
    this.advance(); // move past the "define" token
    const name = this.consume(TokenType.Symbol);
    const value = this.expression();
    this.consume(TokenType.RightBracket);
    return Expr.Define(name, value);
  }

  private set(): SetExpr {
    this.advance(); // move past the "set!" token
    const name = this.consume(TokenType.Symbol);
    const value = this.expression();
    this.consume(TokenType.RightBracket);
    return Expr.Set(name, value);
  }

  let() {
    this.advance(); // move past the "let" token
    this.consume(TokenType.LeftBracket);

    const bindings = [];
    while (!this.match(TokenType.RightBracket)) {
      bindings.push(this.letBinding());
    }

    const body = [];
    while (!this.match(TokenType.RightBracket)) {
      body.push(this.expression());
    }

    return new LetExpr(bindings, body);
  }

  letBinding() {
    this.consume(TokenType.LeftBracket);
    const name = this.consume(TokenType.Symbol);
    const value = this.expression();
    this.consume(TokenType.RightBracket);
    return new LetBindingNode(name, value);
  }

  lambda(): LambdaExpr {
    this.advance(); // move past the "lambda" token
    this.consume(TokenType.LeftBracket);

    const params: Token[] = [];
    while (!this.match(TokenType.RightBracket)) {
      params.push(this.consume(TokenType.Symbol));
    }

    const body: Expr[] = [];
    while (!this.match(TokenType.RightBracket)) {
      body.push(this.expression());
    }

    return new LambdaExpr(params, body);
  }

  private quote(): QuoteExpr {
    this.advance(); // move past the "quote" token

    const value = this.expression();
    this.consume(TokenType.RightBracket);

    return new QuoteExpr(value);
  }

  private shortquote(): QuoteExpr {
    if (this.check(TokenType.LeftBracket)) {
      if (!this.checkNext(TokenType.Symbol)) {
        this.advance();

        const values = [];
        while (!this.match(TokenType.RightBracket)) {
          const e = this.expression();

          values.push(e);
        }

        return Expr.Quote(Expr.Literal(values));
      }
    }

    const value = this.expression();

    return new QuoteExpr(value);
  }
}
