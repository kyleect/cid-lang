import { Token, TokenType } from "./token";

export class Scanner {
  private start: number = 0;
  private current: number = 0;
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
        case " ":
        case "\r":
        case "\t":
        case "\n":
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
        case '"':
          while (this.peek() !== '"' && !this.isAtEnd()) {
            this.advance();
          }
          const literal = this.source.slice(this.start + 1, this.current);
          this.addToken(TokenType.String, literal);
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

          throw new SyntaxError(`Unknown token: ${char}`);
      }
    }

    this.tokens.push(new Token(TokenType.Eof, "", null));
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

  addToken(tokenType: TokenType, literal) {
    const lexeme = this.source.slice(this.start, this.current);
    const token = new Token(tokenType, lexeme, literal);
    this.tokens.push(token);
  }
}