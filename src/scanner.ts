import { SchemeTSSyntaxError } from "./exceptions";
import { Token, TokenType } from "./token";

export class Scanner {
  private lineNumber = 0;
  private charNumber = 0;
  private start = 0;
  private current = 0;
  private tokens: Token[] = [];

  constructor(private source: string) {}

  scan() {
    while (!this.isAtEnd()) {
      // save the index at the start of each new token
      this.start = this.current;

      const char = this.advance();
      switch (char) {
        case "(":
          this.addToken(TokenType.LeftBracket, null);
          break;
        case ")":
          this.addToken(TokenType.RightBracket, null);
          break;
        case "'":
          this.addToken(TokenType.Quote, null);
          break;
        case " ":
        case "\t":
          this.charNumber += 1;
          break;
        case "\r":
        case "\n":
          this.lineNumber += 1;
          this.charNumber = 0;
          break;
        case "#":
          if (this.peek() === "t") {
            this.advance();
            this.addToken(TokenType.Boolean, true);
            break;
          }
          if (this.peek() === "f") {
            this.advance();
            this.addToken(TokenType.Boolean, false);
            break;
          }
          break;
        case '"':
          while (this.peek() !== '"' && !this.isAtEnd()) {
            this.advance();
          }

          this.addToken(
            TokenType.String,
            this.source.slice(this.start + 1, this.current)
          );

          this.advance();

          break;
        default:
          if (this.isDigit(char)) {
            while (this.isDigitOrDot(this.peek())) {
              this.advance();
            }
            const numberAsString = this.source.slice(this.start, this.current);
            const literal = parseFloat(numberAsString);
            this.addToken(TokenType.Number, literal);
            break;
          }

          if (this.isIdentifier(char)) {
            while (this.isIdentifier(this.peek())) {
              this.advance();
            }
            this.addToken(TokenType.Symbol, null);
            break;
          }

          throw new SchemeTSSyntaxError(
            this.lineNumber,
            this.charNumber,
            `Invalid character: ${char}`
          );
      }
    }

    this.addToken(TokenType.Eof, null);
    return this.tokens;
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isDigitOrDot(char: string): boolean {
    return this.isDigit(char) || char === ".";
  }

  private isIdentifier(char: string): boolean {
    return (
      this.isDigitOrDot(char) ||
      (char >= "A" && char <= "Z") ||
      (char >= "a" && char <= "z") ||
      [
        "+",
        "-",
        ".",
        "*",
        "/",
        "<",
        "=",
        ">",
        "!",
        "?",
        ":",
        "$",
        "%",
        "_",
        "&",
        "~",
        "^",
      ].includes(char)
    );
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  advance() {
    return this.source[this.current++];
  }

  peek() {
    return this.source[this.current];
  }

  addToken(tokenType: TokenType, literal: unknown = null) {
    const lexeme = this.source.slice(this.start, this.current);

    let token: Token;

    switch (tokenType) {
      case TokenType.LeftBracket:
        token = Token.LeftBracket(this.lineNumber, this.charNumber);
        this.charNumber += 1;
        break;

      case TokenType.RightBracket:
        token = Token.RightBracket(this.lineNumber, this.charNumber);
        this.charNumber += 1;
        break;

      case TokenType.Quote:
        token = Token.Quote(this.lineNumber, this.charNumber);
        this.charNumber += 1;
        break;

      case TokenType.Symbol:
        token = Token.Symbol(lexeme, this.lineNumber, this.charNumber);
        this.charNumber += lexeme.length;
        break;

      case TokenType.Number:
        token = Token.Number(lexeme, this.lineNumber, this.charNumber);
        this.charNumber += lexeme.length;
        break;

      case TokenType.Boolean:
        if (typeof literal !== "boolean") {
          throw Error(`Invalid literal value for boolean token: ${literal}`);
        }

        token = Token.Boolean(
          lexeme,
          literal,
          this.lineNumber,
          this.charNumber
        );
        this.charNumber += lexeme.length;
        break;

      case TokenType.String:
        token = Token.String(
          lexeme.substring(1),
          this.lineNumber,
          this.charNumber
        );
        this.charNumber += lexeme.length;
        break;

      case TokenType.Eof:
        token = Token.Eof(this.lineNumber + 1, 0);
        break;
    }

    this.tokens.push(token);
  }
}
