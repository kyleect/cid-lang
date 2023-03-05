export enum TokenType {
  LeftBracket = "LeftBracket",
  RightBracket = "RightBracket",
  Symbol = "Symbol",
  Number = "Number",
  Boolean = "Boolean",
  String = "String",
  Eof = "Eof",
}

export class Token {
  constructor(
    private readonly tokenType: TokenType,
    private readonly lexeme: string,
    private readonly literal: unknown
  ) {}

  public getTokenType(): TokenType {
    return this.tokenType;
  }

  public getLexeme(): string {
    return this.lexeme;
  }

  public getLiteral(): unknown {
    return this.literal;
  }

  static LeftBracket(): Token {
    return new Token(TokenType.LeftBracket, "(", null);
  }

  static RightBracket(): Token {
    return new Token(TokenType.RightBracket, ")", null);
  }

  static Symbol(lexeme: string): Token {
    return new Token(TokenType.Symbol, lexeme, null);
  }

  static Number(lexeme: string, literal?: number): Token {
    const numericValue = Number.parseFloat(lexeme);

    if (Number.isNaN(numericValue)) {
      throw new SyntaxError(`Invalid lexeme for a number token: '${lexeme}'`);
    }

    return new Token(TokenType.Number, lexeme, literal ?? numericValue);
  }

  static Boolean(lexeme: string, literal: boolean): Token {
    return new Token(TokenType.Boolean, lexeme, literal);
  }

  static String(lexeme: string, literal: string): Token {
    return new Token(TokenType.String, lexeme, literal);
  }

  static Eof(): Token {
    return new Token(TokenType.Eof, "", null);
  }

  public toString(): string {
    return `<Token type='${this.tokenType}'; lexeme='${this.lexeme}'; literal=${this.literal}>`;
  }
}
