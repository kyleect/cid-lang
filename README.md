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
npm run build && ./dist/lib/cidlang.js spec/test.scm
```

### REPL

```bash
npm run build && ./dist/lib/cidrepl.js

CID> (+ 10 25)
35
```

### Binaries

The `build-bins` script will build out a set of binaries. You must run `build-src` first or run `npm run build`.

- `dist/bins/cidlang-{linux|macos|windows.exe}`
- `dist/bins/cidrepl-{linux|macos|windows.exe}`

```bash
npm run build

./dist/bins/cidlang-linux spec/test.scm

./dist/bins/cidrepl-linux

CID> (+ 10 25)
35
```

### Docker

#### Repl

```bash
npm run build-docker
npm run repl-docker

CID> (+ 10 25)
35
```

#### Cli

```bash
npm run build-docker
npm run cli-docker

# Loading from filename: spec/test.scm
# -----------
# RESULTS
# -----------
# Passed: 20
# Failed: 0
# -----------
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
