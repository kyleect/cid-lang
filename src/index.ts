import { StringTokenizer, Tokenizer } from "./tokenizer";

export function exec(
  source: string,
  env?: Map<string, unknown> | undefined
): unknown {
  const tokenizer: Tokenizer = new StringTokenizer(source);
  const tokens = tokenizer.tokenize();

  return;

  // const parser = new Parser(tokens);
  // const expressions = parser.parse();

  // const interpreter = new Interpreter();

  // Array.from(env?.entries() ?? []).forEach(([key, value]) => {
  //   interpreter.envSet(key, value);
  // });

  // const results = interpreter.interpretAll(expressions);

  // if (typeof results === "string") {
  //   return `"${results}"`;
  // }

  // if (typeof results === "undefined") {
  //   return results;
  // }

  // if (Array.isArray(results)) {
  //   return `(${results.join(" ")})`;
  // }

  // if (results === true) {
  //   return "#t";
  // }

  // if (results === false) {
  //   return "#f";
  // }

  // return results.toString();
}
