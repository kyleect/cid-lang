import { CIDLangError } from "./errors";
import { Sym } from "./symbol";

describe("Sym", () => {
  it("should return symbol's name", () => {
    expect(Sym.of("a").toString()).toBe("a");
  });

  it("should return symbol's name: if", () => {
    expect(Sym.If.toString()).toBe("if");
  });

  it("should return true that if is keyword", () => {
    expect(Sym.isKeyword(Sym.If)).toBe(true);
  });

  it("should return true that define is keyword", () => {
    expect(Sym.isKeyword(Sym.Define)).toBe(true);
  });

  it("should return true that lambda is keyword", () => {
    expect(Sym.isKeyword(Sym.Lambda)).toBe(true);
  });

  it("should return true that quote is keyword", () => {
    expect(Sym.isKeyword(Sym.Quote)).toBe(true);
  });

  it("should return true that set is keyword", () => {
    expect(Sym.isKeyword(Sym.Set)).toBe(true);
  });

  it("should throw if creating symbol matching keyword: define", () => {
    expect(() => Sym.of("define")).toThrow(
      new CIDLangError(`Illegal reference to keyword: define`)
    );
  });

  it("should throw if creating symbol matching keyword: lambda", () => {
    expect(() => Sym.of("lambda")).toThrow(
      new CIDLangError(`Illegal reference to keyword: lambda`)
    );
  });

  it("should throw if creating symbol matching keyword: quote", () => {
    expect(() => Sym.of("quote")).toThrow(
      new CIDLangError(`Illegal reference to keyword: quote`)
    );
  });

  it("should throw if creating symbol matching keyword: if", () => {
    expect(() => Sym.of("if")).toThrow(
      new CIDLangError(`Illegal reference to keyword: if`)
    );
  });

  it("should throw if creating symbol matching keyword: set!", () => {
    expect(() => Sym.of("set!")).toThrow(
      new CIDLangError(`Illegal reference to keyword: set!`)
    );
  });
});
