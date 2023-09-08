import { CIDLangSyntaxError } from "./exceptions";

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
    private readonly literal: unknown,
    private readonly lineNumber: number,
    private readonly charNumber: number
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

  public getLineNumber(): number {
    return this.lineNumber;
  }

  public getCharNumber(): number {
    return this.charNumber;
  }

  static LeftBracket(lineNumber: number, charNumber: number): Token {
    return new Token(TokenType.LeftBracket, "(", null, lineNumber, charNumber);
  }

  static RightBracket(lineNumber: number, charNumber: number): Token {
    return new Token(TokenType.RightBracket, ")", null, lineNumber, charNumber);
  }

  static Quote(lineNumber: number, charNumber: number): Token {
    return new Token(TokenType.Quote, "'", null, lineNumber, charNumber);
  }

  static Symbol(lexeme: string, lineNumber: number, charNumber: number): Token {
    return new Token(TokenType.Symbol, lexeme, null, lineNumber, charNumber);
  }

  static Number(lexeme: string, lineNumber: number, charNumber: number): Token {
    const numericValue = Number.parseFloat(lexeme);

    if (Number.isNaN(numericValue)) {
      throw new CIDLangSyntaxError(
        lineNumber,
        charNumber,
        `Invalid number: '${lexeme}'`
      );
    }

    return new Token(
      TokenType.Number,
      lexeme,
      numericValue,
      lineNumber,
      charNumber
    );
  }

  static Boolean(
    lexeme: string,
    literal: boolean,
    lineNumber: number,
    charNumber: number
  ): Token {
    if (typeof literal !== "boolean") {
      throw Error(`Invalid literal value for boolean token: ${literal}`);
    }

    return new Token(
      TokenType.Boolean,
      lexeme,
      literal,
      lineNumber,
      charNumber
    );
  }

  static String(lexeme: string, lineNumber: number, charNumber: number): Token {
    if (typeof lexeme !== "string") {
      throw SyntaxError(`Lexeme is a non-string for string token: ${lexeme}`);
    }

    return new Token(TokenType.String, lexeme, lexeme, lineNumber, charNumber);
  }

  static Eof(lineNumber: number, charNumber: number): Token {
    return new Token(TokenType.Eof, "", null, lineNumber, charNumber);
  }

  public toString(): string {
    return `<Token type='${this.tokenType}'; lexeme='${this.lexeme}'; literal=${this.literal}; lineNumber=${this.lineNumber}; charNumber=${this.charNumber}>`;
  }
}
