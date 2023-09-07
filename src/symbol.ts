import { SchemeTSError } from "./exceptions";

/**
 * Symbolic Variable
 */
export class Sym {
  private constructor(public name: string) {}

  static keywords: Sym[] = [];

  static keyword(name: string): Sym {
    const sym = Sym.of(name);
    Sym.keywords.push(sym);
    return sym;
  }

  static isKeyword(sym: Sym): boolean {
    return this.keywords.includes(sym);
  }

  static isKeywordByName(name: string): boolean {
    return (
      typeof this.keywords.find((keyword) => keyword.name === name) !==
      "undefined"
    );
  }

  public toString(): string {
    return this.name;
  }

  /**
   * Create symbolic variable from string
   * @param name Name for variable
   * @returns New symbolic variable with name
   */
  static of(name: string): Sym {
    if (Sym.isKeywordByName(name)) {
      throw new SchemeTSError(`Illegal reference to keyword: ${name}`);
    }

    return new Sym(name);
  }

  /**
   * Symbolic variable for define
   */
  static get Define(): Sym {
    return defineSymbol;
  }

  /**
   * Symbolic variable for quote
   */
  static get Quote(): Sym {
    return quoteSymbol;
  }

  /**
   * Symbolic variable for lambda
   */
  static get Lambda(): Sym {
    return lambdaSymbol;
  }

  /**
   * Symbolic variable for if
   */
  static get If(): Sym {
    return ifSymbol;
  }

  /**
   * Symbolic variable for set!
   */
  static get Set(): Sym {
    return setSymbol;
  }
}

const defineSymbol = Sym.keyword("define");
const quoteSymbol = Sym.keyword("quote");
const lambdaSymbol = Sym.keyword("lambda");
const ifSymbol = Sym.keyword("if");
const setSymbol = Sym.keyword("set!");
