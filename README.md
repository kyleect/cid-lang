# schemee

[![verify](https://github.com/kyleect/scheme-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/kyleect/scheme-ts/actions/workflows/ci.yml)

## Usage

### Library

```typescript
import { exec } from "scheme-ts";

exec(`
(define a 100)
(define b 5)
(* a b)
`); // "500"
```

### CLI

```bash
npm run --silent cli -- example.scm
```

## Development

[See DEVELOPMENT.md](DEVELOPMENT.md)
