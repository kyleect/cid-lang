import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

export function exec(
  source: string,
  env?: Map<string, unknown> | undefined
): unknown {
  const scanner = new Scanner(source);
  const tokens = scanner.scan();

  const parser = new Parser(tokens);
  const expressions = parser.parse();

  const interpreter = new Interpreter();

  Array.from(env?.entries() ?? []).forEach(([key, value]) => {
    interpreter.envSet(key, value);
  });

  const results = interpreter.interpretAll(expressions);

  if (typeof results === "string") {
    return `"${results}"`;
  }

  if (typeof results === "undefined") {
    return results;
  }

  if (Array.isArray(results)) {
    return `(${results.join(" ")})`;
  }

  if (results === true) {
    return "#t";
  }

  if (results === false) {
    return "#f";
  }

  return results.toString();
}
