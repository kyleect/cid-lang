#!/usr/bin/env node

import { exec } from ".";
import { readFileSync } from "fs";
import { SchemeTSExitError, SchemeTSSyntaxError } from "./exceptions";

const filename = process.argv?.[2];

if (typeof filename === "undefined") {
  console.log(`Missing filename for *.scm file to run`);
  process.exit(1);
}

console.log(`Loading from filename: ${filename}`);
const file = readFileSync(filename);

const s = file.toString();

try {
  const results = exec(s);
  console.log(results);
} catch (e) {
  if (e instanceof SchemeTSExitError) {
    process.exit(e.exitCode);
  }

  if (e instanceof SchemeTSSyntaxError) {
    console.log(`${e}`);
    process.exit(1);
  }

  console.log(`There was an error throw: ${e}`);
  process.exit(1);
}
