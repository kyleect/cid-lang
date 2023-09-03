export class Environment {
  constructor(
    private values?: Map<string, unknown>,
    private enclosing?: Environment
  ) {
    if (typeof this.values === "undefined") {
      this.values = new Map();
    }
  }

  // Sets the variable value in the
  // environment where it was defined
  set(name: string, value: unknown) {
    if (this.values.has(name) || !this.enclosing) {
      this.values.set(name, value);
    } else if (this.enclosing) {
      this.enclosing.set(name, value);
    } else {
      throw new SyntaxError(`Unknown identifier: ${name}`);
    }
  }

  // Looks up the variable in the environment
  // as well as its enclosing environments
  get(name: string): unknown {
    if (this.values.has(name)) {
      return this.values.get(name);
    } else if (this.enclosing) {
      return this.enclosing.get(name);
    }
  }

  has(name: string): boolean {
    return this.values.has(name) || (this.enclosing?.has(name) ?? false);
  }

  static Default(): Environment {
    const env = new Environment(new Map());

    env.set("+", (a, b) => a + b);
    env.set(">", (a, b) => a > b);
    env.set("boolean?", (a) => typeof a === "boolean");

    return env;
  }
}
