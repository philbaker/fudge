/*
Experimental functions are here because they need more testing / consideration
before finalising and moving to their respective modules

*/
import { iterable, first, last, println } from "./core.js";

/*
core
threadFirst() threads x through the fns. Inserts x as the second item in the first
function. It will do the same for following functions.

threadFirst("3", parseInt);
3

*/
export function threadFirst(x, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}

/*
core
threadLast() threads x through the fns. Inserts x as the last item in the first
function. It will do the same for following functions

threadLast("3", parseInt);
3

*/
export function threadLast(x, ...fns) {
  return fns.reduceRight((acc, fn) => fn(acc), x);
}

/*
core
iff() evaluates the test and returns then if true, otherwise if false

iff(1 > 2, "hello", "world");
"world"

iff(3 > 2, str("hello", " world"), "world");
"hello world"

iff(1 * 2 === 2, (() => 3 * 2)(), 7);
6

*/
export function iff(test, then, otherwise) {
  return test ? then : otherwise;
}

/*
core
cond() takes a set of test / expression pairs. It evaluates each test one at a 
time returning the result for the first true test

function posNegOrZero(n) {
  return cond(
    [() => n < 0, () => "negative"],
    [() => n > 0, () => "positive"],
    [() => "else", () => "zero"]
  )();
}

posNegOrZero(5);
"positive"

*/
export function cond(...xs) {
  return function (...args) {
    for (let i = 0; i < xs.length; i++) {
      const [pred, val] = xs[i];

      if (pred(...args)) {
        return val(...args);
      }
    }

    return null;
  };
}

/*
string
split() splits a string on regular expression. JavaScript's limit works 
differently to Java's. This implementation mimics Java's. 

split("Hello world", " ");
[ 'Hello', 'world' ]

split("JavaScript is awesome!", " ")
[ 'JavaScript', 'is', 'awesome!' ]

split("q1w2e3r4t5y6u7i8o9p0", /\d+/);
[ "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "" ]

split("q1w2e3r4t5y6u7i8o9p0", /\d+/, -1);
[ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '']

split("q1w2e3r4t5y6u7i8o9p0", /\d+/, 5); 
[ 'q', 'w', 'e', 'r', 't5y6u7i8o9p0' ]

split("q1w2e3r4t5y6u7i8o9p0", /\d+/, -1); 
[ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '' ]

split("fooxbarybaz", /[xy]/, 2)
[ 'foo', 'barybaz' ]

split(" q1w2 ", "");
[ " ", "q", "1", "w", "2", " " ]

split("a", "b");
[ "a" ]

split("foo--bar--baz", "--");
[ 'foo', 'bar', 'baz' ]

*/
export function split(s, re, limit) {
  if (limit === undefined) {
    return split(s, re, 0);
  }

  if (limit === -1) {
    return s.split(re);
  }

  if (limit === 0) {
    let v = s.split(re);

    if (last(v) === "") {
      v.pop();
    }

    return v;
  }

  let parts = [];

  while (limit > 1 && s.length > 0) {
    let m = s.match(re);

    if (!m) {
      parts.push(s);
      break;
    }

    let index = s.indexOf(m[0]);
    parts.push(s.substring(0, index));
    s = s.substring(index + m[0].length);
    limit--;
  }

  parts.push(s);

  return parts;
}

/*
lett() groups variables in a single scope

lett([["x", 3], ["y", 4], ["z", 55]], (xs) => {
  return (xs.x * xs.y) + xs.z;
});

*/
export function lett(bindings, f) {
  return (() => {
    const scope = {};

    for (let i = 0; i < bindings.length; i++) {
      scope[first(bindings[i])] = last(bindings[i]);
    }

    return f(scope);
  })();
}

/*
and() evaluates expressions from left to right and returns the first
argument that is falsy or the last arg if all args are truthy

and(true, true);
true

and(true, false);
false

and(list(), list());
List(0) []

and([], []);
[]

and({}, []);
[]

and(false, null);
false

and(null, false);
null

and(0, 1);
1

and(1, 0);
0

and(null, null);
null

null === false

*/
export function and(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === null || args[i] === undefined || args[i] === false) {
      return args[i];
    }
  }

  return args[args.length - 1];
}

/*
or() returns the first argument that is truthy or the last argument
if all arguments are falsy

or(true, false, false);
true

or(true, true, true);
true

or(false, false, false);
false

or(null, null);
null

or(null, false);
false

or(false, null);
null

or(true, null);
true

or(false, 42);
42

or(false, 42, 9999);
42

*/
export function or(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== false && args[i] !== undefined && args[i] !== null) {
      return args[i];
    }
  }

  return args[args.length - 1];
}

/*
isNumber() returns true if x is a number

isNumber(1);
true

isNumber("1");
false

isNumber(undefined);
false

isNumber(+"1");
true

*/
export function isNumber(x) {
  return typeof x === "number";
}

/*
isString() returns true if x is a string

isString(5);
false

isString(true);
false

*/
export function isString(x) {
  return typeof x === "string";
}

/*
isMap() returns true if x is a Map
note that this is a JavaScript Map rather than an Object

isMap([]);
false

isMap(new Map());
true

isMap({});
false

*/
export function isMap(x) {
  return typeConst(x) === MAP_TYPE;
}

/*
isObject() returns true if x is an Object

isObject([]);
false

isObject(list());
false

isObject("abcdef");
false

isObject({a: 2});
true

*/
export function isObject(x) {
  return typeConst(x) === OBJECT_TYPE;
}

/*
isVector() returns true if x is an Array

isVector("abc");
false

isVector({});
false

isVector([]);
true

*/
export function isVector(x) {
  return typeConst(x) === ARRAY_TYPE;
}

/*
isList() returns true if x is a list

isList("abc");
false

isList({});
false

isList([]);
false

isList(list());
true

*/
export function isList(x) {
  return typeConst(x) === LIST_TYPE;
}

/*
isSet() returns true if x is a Set

isSet("abc");
false

isSet({});
false

isSet([]);
false

isSet(list());
false

isSet(set());
true

*/
export function isSet(x) {
  return typeConst(x) === SET_TYPE;
}
