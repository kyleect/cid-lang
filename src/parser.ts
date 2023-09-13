import { Cell } from "./cell";
import { CIDLangSyntaxError } from "./errors";
import {
  AtomicExpression,
  Expression,
  NullExpression,
  Program,
} from "./expression";
import { Sym } from "./symbol";
import { Token, TokenType } from "./token";

export abstract class Parser {
  abstract parse(): Program;

  public static Token(tokens: Token[]): TokenParser {
    return new TokenParser(tokens);
  }
}

/**
 * Parses tokens in to expressions
 */
export class TokenParser implements Parser {
  #current = 0;

  constructor(private tokens: Token[]) {}

  /**
   * Parse tokens in to expressions
   * @returns A program of one or more expressions from parsing tokens
   */
  parse(): Program {
    if (this.tokens.length === 1) {
      throw new CIDLangSyntaxError(0, 0, "Unexpected EOF");
    }

    const program: Program = [];

    while (!this.#isEofToken()) {
      const expression = this.#expression();
      program.push(expression);
    }

    return program;
  }

  /**
   * Parse one or more tokens in to an expression
   * @returns Parsed expression
   */
  #expression(): Expression {
    let expression: Expression;

    if (this.#check(TokenType.LeftBracket)) {
      this.#advance();

      if (this.#check(TokenType.RightBracket)) {
        expression = NullExpression;
      } else {
        const values = [];

        while (!this.#check(TokenType.RightBracket)) {
          const valueExpression = this.#expression();
          values.push(valueExpression);
        }

        expression = Cell.list(...values);
      }
    }

    if (this.#check(TokenType.Number)) {
      const token = this.#peek();

      expression = token.getLiteral() as AtomicExpression;
    }

    if (this.#check(TokenType.String)) {
      const token = this.#peek();

      expression = token.getLiteral() as AtomicExpression;
    }

    if (this.#match(TokenType.Quote)) {
      const cell = Cell.list(Sym.Quote, this.#expression());
      return cell;
    }

    if (this.#check(TokenType.Symbol)) {
      const token = this.#peek();
      const lexeme = token.getLexeme();

      switch (true) {
        case lexeme === Sym.Quote.name:
          expression = Sym.Quote;
          break;
        case lexeme === Sym.Define.name:
          expression = Sym.Define;
          break;
        case lexeme === Sym.Lambda.name:
          expression = Sym.Lambda;
          break;
        case lexeme === Sym.If.name:
          expression = Sym.If;
          break;
        case lexeme === Sym.Set.name:
          expression = Sym.Set;
          break;
        case lexeme === Sym.Begin.name:
          expression = Sym.Begin;
          break;
        default:
          expression = Sym.of(token.getLexeme());
          break;
      }
    }

    if (this.#check(TokenType.Boolean)) {
      const token = this.#peek();
      expression = token.getLiteral() as AtomicExpression;
    }

    if (!this.#isEofToken()) {
      this.#advance();
    }

    return expression;
  }

  /**
   * Returns the current token
   * @returns Current token being worked
   */
  #peek(): Token {
    return this.tokens[this.#current];
  }

  debugPeek(): Token {
    return this.#peek();
  }

  debugIsEof(): boolean {
    return this.#isEofToken();
  }

  /**
   * Returns what the next token will be
   * @returns Next token being to be worked
   */
  #peekNext(): Token {
    return this.tokens[this.#current + 1];
  }

  /**
   * Returns what the previous token was be
   * @returns Next token being to be worked
   */
  #peekPrevious(): Token {
    return this.tokens[this.#current - 1];
  }

  #isEofToken(): boolean {
    return this.#check(TokenType.Eof);
  }

  /**
   * Check if the current token is of the expected token type
   * @param {TokenType} tokenType The token type to check for
   * @returns {boolean} Result of the check
   */
  #check(tokenType: TokenType): boolean {
    return this.#peek().getTokenType() === tokenType;
  }

  /**
   * Move to the next token if current token is of the expected token type
   * @param {TokenType} tokenType The token type to check for
   * @returns {boolean} Result of the check
   */
  #match(tokenType: TokenType): boolean {
    if (this.#check(tokenType)) {
      this.#advance();
      return true;
    }
    return false;
  }

  /**
   * Check if the next token is of the expected token type
   * @param {TokenType} tokenType The token type to check for
   * @returns {boolean} Result of the check
   */
  #checkNext(tokenType: TokenType): boolean {
    return this.#peekNext().getTokenType() === tokenType;
  }

  /**
   * Move to and return next token if the current token matches expected token type
   * @param tokenType
   * @returns {Token}
   */
  #consume(tokenType: TokenType): Token {
    if (this.#check(tokenType)) {
      return this.#advance();
    }

    const token = this.#peek();

    throw new CIDLangSyntaxError(
      token.getLineNumber(),
      token.getCharNumber(),
      `Unexpected token ${this.#peekPrevious().getTokenType()}, expected ${tokenType}`
    );
  }

  /**
   * Move to the next token
   * @returns The next token
   */
  #advance(): Token {
    return this.tokens[this.#current++];
  }
}
