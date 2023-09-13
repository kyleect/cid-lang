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
npx turbo build-src && ./dist/cidlang.js spec/test.scm
```

### REPL

```bash
npx turbo build-src && ./dist/cidrepl.js

CID> (+ 10 25)
35
```

### Binaries

The `build-bins` script will build out a set of binaries. You must run `build-src` first!

- `{linux|macos|windows}-cidlang[.exe]`
- `{linux|macos|windows}-cidrepl[.exe]`

```bash
npx turbo build-src build-bins

./dist/linux-cidlang spec/test.scm

./dist/linux-cidrepl

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

#### Terminal

```bash
npm run build-docker
npm run start-docker

550f...:/usr/src/cidlang# cidlang spec/test.scm
550f...:/usr/src/cidlang# cidrepl

CID> (+ 10 25)
35
```

```bash
npm run build-docker && npm run start-docker

CID> (+ 10 25)
35
```

## Differences To Scheme (So Far)

- Quoting lists is not required

## Todos

- Lots of stuff!
- Most built-in functions
- Macros

## Development

[See DEVELOPMENT.md](DEVELOPMENT.md)
