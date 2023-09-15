import { CIDLangError } from "./errors";

/**
 * Symbolic Variable
 */
export class Sym {
  private constructor(public name: string) {}

  static keywords: Sym[] = [];

  /**
   * Check if value is a Sym
   * @param value Value to check
   * @returns If value is an instance of Sym
   */
  static is(value: unknown): value is Sym {
    return value instanceof Sym;
  }

  /**
   * Register a keyword sym
   *
   * This prevents a Sym being created of the same name as the keyword
   *
   * @param name Name of keyword
   * @returns Sym for the keyword
   */
  static keyword(name: string): Sym {
    const sym = Sym.of(name);
    Sym.keywords.push(sym);
    return sym;
  }

  /**
   * Check if value is a keyword Sym
   * @param value VAlue to check
   * @returns If value is a keword Sym
   */
  static isKeyword(value: unknown): boolean {
    if (!Sym.is(value)) {
      return false;
    }

    return this.keywords.includes(value);
  }

  /**
   * Check if name matches a keyword Sym
   * @param name Name of keyword to check
   * @returns If name matches a keyword Sym
   */
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
   * Create Sym from name string
   *
   * Will throw if name matches a keyword Sym
   * @param name Name for Sym
   * @returns Newly created Sym with name
   */
  static of(name: string): Sym {
    if (Sym.isKeywordByName(name)) {
      throw new CIDLangError(`Illegal reference to keyword: ${name}`);
    }

    return new Sym(name);
  }

  /**
   * Reference to define keyword Sym
   */
  static get Define(): Sym {
    return defineSymbol;
  }

  /**
   * Reference to quote keyword Sym
   */
  static get Quote(): Sym {
    return quoteSymbol;
  }

  /**
   * Reference to lambda keyword Sym
   */
  static get Lambda(): Sym {
    return lambdaSymbol;
  }

  /**
   * Reference to if keyword Sym
   */
  static get If(): Sym {
    return ifSymbol;
  }

  /**
   * Reference to set! keyword Sym
   */
  static get Set(): Sym {
    return setSymbol;
  }

  /**
   * Reference to begin keyword Sym
   */
  static get Begin(): Sym {
    return beginSymbol;
  }

  static get Let(): Sym {
    return letSymbol;
  }
}

const defineSymbol = Sym.keyword("define");
const quoteSymbol = Sym.keyword("quote");
const lambdaSymbol = Sym.keyword("lambda");
const ifSymbol = Sym.keyword("if");
const setSymbol = Sym.keyword("set!");
const beginSymbol = Sym.keyword("begin");
const letSymbol = Sym.keyword("let");
