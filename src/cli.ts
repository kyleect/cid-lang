#!/usr/bin/env node

import { exec } from ".";
import { readFileSync } from "fs";
import { SchemeTSExitError } from "./exceptions";

const [_, __, filename] = process.argv;

const file = readFileSync(filename);

const s = file.toString();

try {
  const results = exec(s);
  console.log(results);
} catch (e) {
  if (e instanceof SchemeTSExitError) {
    process.exit(e.exitCode);
  }

  console.log(`There was an error throw: ${e}`);
}
