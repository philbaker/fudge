# Fudge

Fudge is a library of Clojure-inspired functions for JavaScript. it is based on 
[Squint](https://github.com/squint-cljs/squint) with some modifications to make 
it suitable for direct use in JavaScript. 

## Status
This project is experimental and there will likely be breaking changes. Do not
use in production.

## Install
`npm i fudgejs`

## Usage

Import functions from core.js and string.js as needed

```javascript
import { not } from "fudgejs/core.js";
import { trim } from "fudgejs/string.js";

not(true);
// false

trim(" hello   ");
// 'hello'
```

All functions are listed at https://philbaker.dev/fudge/index.html

## REPL
Experiment with Fudge functions in the REPL by running `node repl.js`. 

## Inspired by
- [Squint](https://github.com/squint-cljs/squint)
- [Clojure](https://github.com/clojure/clojure)
- [ClojureDocs](https://clojuredocs.org)
- [Grokking Simplicity](https://www.manning.com/books/grokking-simplicity)
- [Atomic](https://github.com/mlanza/atomic)
- [Functional core, imperative shell](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)

## Generate docs
```jsdoc core.js -c jsdoc.json -r README.md```

## License

Copyright © 2023 Phil Baker

Fudge is licensed under EPL v1.0. See LICENSE for more details.
