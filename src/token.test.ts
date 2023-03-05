import { Token } from "./token";

describe("Token", () => {
  describe("LeftBracket", () => {
    it("should stringify LeftBracket token", () => {
      expect(Token.LeftBracket().toString()).toBe(
        "<Token type='LeftBracket'; lexeme='('; literal=null>"
      );
    });
  });

  describe("RightBracket", () => {
    it("should stringify RightBracket token", () => {
      expect(Token.RightBracket().toString()).toBe(
        "<Token type='RightBracket'; lexeme=')'; literal=null>"
      );
    });
  });

  describe("Symbol", () => {
    it("should stringify Symbol token", () => {
      expect(Token.Symbol("expectedSymbol").toString()).toBe(
        "<Token type='Symbol'; lexeme='expectedSymbol'; literal=null>"
      );
    });
  });

  describe("Number", () => {
    it("should set literal value from lexeme", () => {
      expect(Token.Number("123").toString()).toBe(
        "<Token type='Number'; lexeme='123'; literal=123>"
      );
    });

    it("should stringify Number token", () => {
      expect(Token.Number("123", 123).toString()).toBe(
        "<Token type='Number'; lexeme='123'; literal=123>"
      );
    });

    it("should throw if lexeme is not a number", () => {
      expect(() => Token.Number('"notANumber"')).toThrow(
        new SyntaxError(`Invalid lexeme for a number token: '\"notANumber\"'`)
      );
    });

    it("should throw if lexeme and literal don't match if passed", () => {
      expect(() => Token.Number("123", 456)).toThrow(
        new SyntaxError(
          `Mismatched lexeme and literal value for number token: 123 vs 456`
        )
      );
    });
  });

  describe("Boolean", () => {
    it("should stringify false Boolean token", () => {
      expect(Token.Boolean("#f", false).toString()).toBe(
        "<Token type='Boolean'; lexeme='#f'; literal=false>"
      );
    });

    it("should stringify true Boolean token", () => {
      expect(Token.Boolean("#t", true).toString()).toBe(
        "<Token type='Boolean'; lexeme='#t'; literal=true>"
      );
    });
  });

  describe("String", () => {
    it("should stringify LeftBracket token", () => {
      expect(
        Token.String('"expectedString"', "expectedString").toString()
      ).toBe(
        "<Token type='String'; lexeme='\"expectedString\"'; literal=expectedString>"
      );
    });
  });

  describe("Eof", () => {
    it("should stringify LeftBracket token", () => {
      expect(Token.Eof().toString()).toBe(
        "<Token type='Eof'; lexeme=''; literal=null>"
      );
    });
  });
});
