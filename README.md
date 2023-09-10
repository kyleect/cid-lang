# 🧩 The CID Programming Language

[![verify](https://github.com/kyleect/cid-lang/actions/workflows/ci.yml/badge.svg)](https://github.com/kyleect/cid-lang/actions/workflows/ci.yml)

An (on going) implementation of a Scheme based language.

## Usage

### Library

```typescript
import { exec } from "cid-lang";

exec(`
(define a 100)
(define b 5)
(* a b)
`); // "500"
```

### CLI

```bash
npm run build
./dist/cli.js spec/test.scm
```

### REPL

```bash
npm build && ./dist/repl.js

CID> (+ 10 25)
35
```

## Differences To Scheme (So Far)

- All Expressions Self Evaluate

## Todos

- Lots of stuff!
- Most built-in functions
- Macros

## Development

[See DEVELOPMENT.md](DEVELOPMENT.md)
