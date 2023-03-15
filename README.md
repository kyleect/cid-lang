# schemee

[![verify](https://github.com/kyleect/scheme-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/kyleect/scheme-ts/actions/workflows/ci.yml)

## Usage

```typescript
import expect from "expect";
import {exec} from "schemee";

const env = new Map<string, unknown>();
env.set('a', 10);

const result = exec("(* a 5)");

expect(result).toBe(50);
```