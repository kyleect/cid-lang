import { Expression } from "./expression";
import { Interpreter } from "./interpreter";
import { TokenParser } from "./parser";
import { StringTokenizer, Tokenizer } from "./tokenizer";

export function exec(
  source: string,
  env?: Map<string, unknown> | undefined
): Expression {
  const tokenizer: Tokenizer = new StringTokenizer(source);
  const tokens = tokenizer.tokenize();

  const parser = new TokenParser(tokens);
  const expression = parser.parse();

  const interpreter = new Interpreter();

  Array.from(env?.entries() ?? []).forEach(([key, value]) => {
    interpreter.env.set(key, value);
  });

  const results = interpreter.interpretProgram(expression);

  return results;
}
