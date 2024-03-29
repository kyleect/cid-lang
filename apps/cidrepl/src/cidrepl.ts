#!/usr/bin/env node

import repl from "repl";
import { exec } from "cidlib";

const inputs: string[] = [];

function run(input: string) {
  inputs.push(input);

  try {
    return exec(inputs.join("\n"));
  } catch (e) {
    inputs.pop();
    console.log(`Error with input: ${e}`);
  }
}

repl.start({
  prompt: "CID> ",
  eval: (input, context, filename, callback) => {
    callback(null, run(input));
  },
});
