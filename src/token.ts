export enum TokenType {
  LeftBracket = "LeftBracket",
  RightBracket = "RightBracket",
  Quote = "Quote",
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
  ) { }

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

  static Quote(): Token {
    return new Token(TokenType.Quote, "'", null);
  }

  static Symbol(lexeme: string): Token {
    return new Token(TokenType.Symbol, lexeme, null);
  }

  static Number(lexeme: string): Token {
    const numericValue = Number.parseFloat(lexeme);

    if (Number.isNaN(numericValue)) {
      throw new SyntaxError(`Invalid lexeme for a number token: '${lexeme}'`);
    }

    return new Token(TokenType.Number, lexeme, numericValue);
  }

  static Boolean(lexeme: string, literal: boolean): Token {
    if (typeof literal !== "boolean") {
      throw Error(`Invalid literal value for boolean token: ${literal}`);
    }

    return new Token(TokenType.Boolean, lexeme, literal);
  }

  static String(lexeme: string): Token {
    if (typeof lexeme !== "string") {
      throw SyntaxError(`Lexeme is a non-string for string token: ${lexeme}`);
    }

    return new Token(TokenType.String, lexeme, lexeme);
  }

  static Eof(): Token {
    return new Token(TokenType.Eof, "", null);
  }

  public toString(): string {
    return `<Token type='${this.tokenType}'; lexeme='${this.lexeme}'; literal=${this.literal}>`;
  }
}
