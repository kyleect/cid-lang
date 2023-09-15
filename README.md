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
npm run build && npm run cli -- spec/test.scm
```

### REPL

```bash
npm run build && npm run repl

CID> (+ 10 25)
35
```

### Binaries

```bash
npm run build

apps/cidlang/dist/bins/cidlang-{linux|macos|windows.exe} spec/test.scm

# .....

apps/cidrepl/dist/bins/cidrep-{linux|macos|windows.exe}

CID> (+ 10 25)
35
```

## Spec

Language spec tests are found in [./spec](./spec) and can be ran:

```bash
npm run build

dist/lib/cidlang.js spec/test.scm
```

## Differences To Scheme (So Far)

- Quoting lists is not required
- Case sensitive identifiers

## Todos

- Lots of stuff!
- Most built-in functions
- Macros

## Development

[See DEVELOPMENT.md](DEVELOPMENT.md)
