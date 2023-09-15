#!/usr/bin/env node

import { readFileSync } from "fs";
import { exec, CIDLangError } from "cidlib";

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
  if (CIDLangError.isError(e)) {
    if (CIDLangError.isExitError(e)) {
      process.exit(e.exitCode);
    }

    console.log(`${e}`);
    process.exit(1);
  }

  console.log(`There was an non CID error throw: ${e}`);
  process.exit(1);
}
