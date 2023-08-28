import { Token } from "./token";

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

describe("Token", () => {
  let lineNumber: number;
  let charNumber: number;

  beforeEach(() => {
    lineNumber = getRandomArbitrary(0, 100);
    charNumber = getRandomArbitrary(0, 100);
  });

  describe("LeftBracket", () => {
    it("should stringify LeftBracket token", () => {
      expect(Token.LeftBracket(lineNumber, charNumber).toString()).toBe(
        `<Token type='LeftBracket'; lexeme='('; literal=null; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });

    it("should be equal to another with same line and char number", () => {
      expect(Token.LeftBracket(lineNumber, charNumber)).toStrictEqual(
        Token.LeftBracket(lineNumber, charNumber)
      );
    });

    it("should be equal to another with same char number but with different line number", () => {
      expect(Token.LeftBracket(lineNumber + 1, charNumber)).not.toStrictEqual(
        Token.LeftBracket(lineNumber, charNumber)
      );
    });

    it("should be equal to another with same line number but with different char number", () => {
      expect(Token.LeftBracket(lineNumber, charNumber + 1)).not.toStrictEqual(
        Token.LeftBracket(lineNumber, charNumber)
      );
    });
  });

  describe("RightBracket", () => {
    it("should stringify RightBracket token", () => {
      expect(Token.RightBracket(lineNumber, charNumber).toString()).toBe(
        `<Token type='RightBracket'; lexeme=')'; literal=null; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });

    it("should be equal to another with same line and char number", () => {
      expect(Token.RightBracket(lineNumber, charNumber)).toStrictEqual(
        Token.RightBracket(lineNumber, charNumber)
      );
    });

    it("should be equal to another with same char number but with different line number", () => {
      expect(Token.RightBracket(lineNumber + 1, charNumber)).not.toStrictEqual(
        Token.RightBracket(lineNumber, charNumber)
      );
    });

    it("should be equal to another with same line number but with different char number", () => {
      expect(Token.RightBracket(lineNumber, charNumber + 1)).not.toStrictEqual(
        Token.RightBracket(lineNumber, charNumber)
      );
    });
  });

  describe("Symbol", () => {
    it("should stringify Symbol token", () => {
      expect(
        Token.Symbol("expectedSymbol", lineNumber, charNumber).toString()
      ).toBe(
        `<Token type='Symbol'; lexeme='expectedSymbol'; literal=null; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });
  });

  describe("Number", () => {
    it("should set literal value from lexeme", () => {
      expect(Token.Number("123", lineNumber, charNumber).toString()).toBe(
        `<Token type='Number'; lexeme='123'; literal=123; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });

    it("should stringify Number token", () => {
      expect(Token.Number("123", lineNumber, charNumber).toString()).toBe(
        `<Token type='Number'; lexeme='123'; literal=123; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });

    it("should throw if lexeme is not a number", () => {
      expect(() =>
        Token.Number('"notANumber"', lineNumber, charNumber)
      ).toThrow(
        new SyntaxError(
          `A syntax error occurred (${lineNumber}, ${charNumber}): Invalid number: '"notANumber"'`
        )
      );
    });
  });

  describe("Boolean", () => {
    it("should stringify false Boolean token", () => {
      expect(
        Token.Boolean("#f", false, lineNumber, charNumber).toString()
      ).toBe(
        `<Token type='Boolean'; lexeme='#f'; literal=false; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });

    it("should stringify true Boolean token", () => {
      expect(Token.Boolean("#t", true, lineNumber, charNumber).toString()).toBe(
        `<Token type='Boolean'; lexeme='#t'; literal=true; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });

    it("should throw if literal value it not a boolean", () => {
      expect(() =>
        Token.Boolean("#t", 123 as unknown as boolean, lineNumber, charNumber)
      ).toThrow("Invalid literal value for boolean token: 123");
    });
  });

  describe("String", () => {
    it("should stringify String token", () => {
      expect(
        Token.String("expectedString", lineNumber, charNumber).toString()
      ).toBe(
        `<Token type='String'; lexeme='expectedString'; literal=expectedString; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });
  });

  describe("Eof", () => {
    it("should stringify LeftBracket token", () => {
      expect(Token.Eof(lineNumber, charNumber).toString()).toBe(
        `<Token type='Eof'; lexeme=''; literal=null; lineNumber=${lineNumber}; charNumber=${charNumber}>`
      );
    });
  });
});
