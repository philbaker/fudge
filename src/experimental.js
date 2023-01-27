/*
Experimental functions are here because they need more testing / consideration
before finalising and moving to their respective modules

*/
import { isEmpty, first, last, isInstance, not, list, List } from "./core.js";

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

/*
equals() compares x, y and args

equals(5);
true

equals(1, 2);
false

equals(1, 1, 1);
true

equals(1, 1, 2);
false

equals(1, 1, 1, 1);
true

equals(1, 1);
true

equals(null, null);
true

equals(null, null, null);
true

equals(false, false);
true

equals(true, true);
true

equals(undefined, undefined);
true

equals([1, 2], [1, 2]);
true

equals([1, 2], [1, 2], [1, 2]);
true

equals([1, 2, [3, 4, [{a: "b"}]]], [1, 2, [3, 4, [{a: "b"}]]]);
true

equals([1, 2, [3, 4, [{a: "b"}]]], [1, 2, [3, 4, [{a: "b"}]]], [1, 2, [3, 4, [{a: "b"}]]]);
true

equals([1, 2, [3, 4, [{a: "d"}]]], [1, 2, [3, 4, [{a: "b"}]]]);
false

equals([1, 2, [3, 4, [{a: "b"}]]], [1, 2, [3, 4, [{a: "d"}]]], [1, 2, [3, 4, [{a: "b"}]]]);
false

equals([1, 2], [1, 2, 3]);
false

equals({a: 1, b: 2}, {a: 1, b: 2});
true

equals({a: 1, b: 2}, {a: 1, b: 2}, {a: 1, b: 2});
true

equals({a: 1, b: 2}, {a: 1, b: 2, c: 3});
false

equals({a: 1, b: 2}, {a: 1, b: 2, c: 3}, {a: 1});
false

equals({a:1, b:2 }, {a: 2, b: 1});
false

equals(list(1, 2, 3), [1, 2, 3]);
true

equals(list(1, 2, 3), [1, 2, 3], list(1, 2, 3));
true

equals(list(1, 2, 3), list(1, 2, 3));
true

equals(null, 1);
false

equals({a: [1, 2], b: "hello"}, {a: [1, 2], b: "hello"});
true

equals({a: [1, 2], b: "hello"}, {a: [1, 2], b: "hello"}, {a: [1, 2], b: "hello"});
true

equals(set([1, 2, 3]), set([1, 2, 3]));
true

equals(set([1, 2, 3]), set([1, 2, 3]), set([1, 2, 3]));
true

equals(set([1, 2]), set([1, 2, 3]));
false

equals(map(1, 2), set([1, 2, 3]));
false

var eqMap = new Map();
eqMap.set("a", 1);
eqMap.set("b", 2);
eqMap.set("c", 3);

var eqMap2 = new Map();
eqMap2.set("a", 1);
eqMap2.set("b", 2);
eqMap2.set("c", 3);

var eqMap3 = new Map();
eqMap3.set("a", 1);
eqMap3.set("b", 2);

equals(eqMap, eqMap2);
true

equals(eqMap, eqMap, eqMap);
true

equals(eqMap, eqMap3);
false

*/
export function equals(x, y, ...args) {
  if (not(isEmpty(args))) {
    let compare = [x, y, ...args];
    let firstv = first(compare);

    for (let i = 0; i < compare.length; i++) {
      if (!isEqual(firstv, compare[i])) {
        return false;
      }
    }

    return true;
  }

  return isEqual(x, y);
}

/*
Internal function
isEqual() is a helper for equals()

*/
function isEqual(x, y) {
  if (not(y)) {
    return true;
  }

  if (isInstance(Set, x) && isInstance(Set, y)) {
    if (x.size !== y.size) {
      return false;
    }

    for (let v of x.values()) {
      if (!y.has(v)) {
        return false;
      }
    }

    return true;
  }

  if (isInstance(Map, x) && isInstance(Map, y)) {
    if (x.size !== y.size) {
      return false;
    }

    for (let [k, v] of x.entries()) {
      if (!y.has(k) || !equals(v, y.get(k))) {
        return false;
      }
    }

    return true;
  }

  if (isInstance(List, x) || isInstance(List, y)) {
    try {
      return equals([...x], [...y]);
    } catch (error) {
      return false;
    }
  }

  if (isInstance(Array, x) && isInstance(Array, y)) {
    if (x.length !== y.length) {
      return false;
    }

    for (let i = 0; i < x.length; i++) {
      try {
        if (!equals(x[i], y[i])) {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  if (isInstance(Object, x) && isInstance(Object, y)) {
    let xk = Object.keys(x);
    let yk = Object.keys(y);

    if (xk.length !== yk.length) {
      return false;
    }

    for (let i = 0; i < xk.length; i++) {
      let k = xk[i];

      try {
        if (!equals(x[k], y[k])) {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  return x === y;
}

/*
notEquals() is the same as not(equals(x, y))

notEquals(1);
false

notEquals(1, 2);
true

notEquals([1, 2], [3, 4]);
true

*/
export function notEquals(x, y, ...args) {
  return not(equals(x, y, ...args));
}

/*
int() coerces x to an integer 

int(1);
1

int(1.2);
1

*/
export function int(x) {
  return parseInt(x);
}

/*
symbol() returns a Symbol with the given name

symbol("foo");
Symbol(foo)

*/
export function symbol(name) {
  return Symbol(name);
}

/*
name() returns the name of a Symbol

name(symbol("foo"));
'foo'

*/
export function name(symbol) {
  return symbol.toString().slice(7, -1);
}
