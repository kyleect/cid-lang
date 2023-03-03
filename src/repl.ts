import repl from "repl";
import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

const inputs: string[] = [];

function run(input: string) {
  inputs.push(input);

  const scanner = new Scanner(inputs.join("\n"));
  const parser = new Parser(scanner.scan());
  const expressions = parser.parse();
  const interpreter = new Interpreter();
  return interpreter.interpretAll(expressions);
}

repl.start({
  prompt: "schemee> ",
  eval: (input, context, filename, callback) => {
    callback(null, stringify(run(input)));
  },
});

function stringify(value) {
  if (value === false) return "#f";
  if (value === true) return "#t";
  if (Array.isArray(value)) return "(" + value.map(stringify).join(" ") + ")";
  if (value instanceof Function) return "PrimitiveProcedure";
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}
