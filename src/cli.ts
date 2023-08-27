#!/usr/bin/env node

import { exec } from ".";
import { readFileSync } from "fs";

const [_, __, filename] = process.argv;

const file = readFileSync(filename);

const s = file.toString();

const results = exec(s);

console.log(results);
