// -------------------------//
//------- Data types -------//
// -------------------------//
const MAP_TYPE = 1;
const ARRAY_TYPE = 2;
const OBJECT_TYPE = 3;
const LIST_TYPE = 4;
const SET_TYPE = 5;
const LAZY_ITERABLE_TYPE = 6;

function emptyOfType(type) {
  switch (type) {
    case MAP_TYPE:
      return new Map();
    case ARRAY_TYPE:
      return [];
    case OBJECT_TYPE:
      return {};
    case LIST_TYPE:
      return new List();
    case SET_TYPE:
      return new Set();
    case LAZY_ITERABLE_TYPE:
      return lazy(function* () {
        return;
      });
  }
  return undefined;
}

function typeConst(obj) {
  if (obj instanceof Map) {
    return MAP_TYPE;
  }

  if (obj instanceof Set) {
    return SET_TYPE;
  }

  if (obj instanceof List) {
    return LIST_TYPE;
  }

  if (obj instanceof Array) {
    return ARRAY_TYPE;
  }

  if (obj instanceof LazyIterable) {
    return LAZY_ITERABLE_TYPE;
  }

  if (obj instanceof Object) {
    return OBJECT_TYPE;
  }

  return undefined;
}

class List extends Array {
  constructor(...args) {
    super();
    this.push(...args);
  }
}

// -------------------------//
//---------- Seqs ----------//
// -------------------------//
export function isSeqable(x) {
  return (
    typeof x === "string" ||
    x === null ||
    x === undefined ||
    Symbol.iterator in x
  );
}
// isSeqable("hello");
// true

function iterable(x) {
  if (x === null || x === undefined) {
    return [];
  }

  if (isSeqable(x)) {
    return x;
  }

  return Object.entries(x);
}

const IIterable = Symbol("Iterable");

const IIterableIterator = Symbol.iterator;

function iterator(coll) {
  return coll[Symbol.iterator]();
}

function seq(x) {
  let iter = iterable(x);

  if (iter.length === 0 || iter.size === 0) {
    return null;
  }
  return iter;
}
// seq(null);
// null
// seq("");
// null
// seq([1, 2]);
// [ 1, 2 ]
// seq({ name: "George", occupation: "Sofa tester" });
// [
//   ["name", "George"],
//   ["occupation", "Sofa tester"],
// ];

class LazyIterable {
  constructor(gen) {
    this.gen = gen;
  }
  [IIterable] = true;
  [Symbol.iterator]() {
    return this.gen();
  }
}

function lazy(f) {
  return new LazyIterable(f);
}

function rest(coll) {
  return lazy(function* () {
    let first = true;
    for (const x of iterable(coll)) {
      if (first) {
        first = false;
      } else {
        yield x;
      }
    }
  });
}
rest([1, 2, 3]);
// [...rest([1, 2, 3])];
// [ 2, 3 ]

// -------------------------//
//------- Collections ------//
// -------------------------//

export function first(coll) {
  let [first] = iterable(coll);
  return first;
}
// first([1, 2, 3]);
// 1
// first("abc");
// 'a'
// first({name: "George", weight: 100})
// [ 'name', 'George' ]

export function second(coll) {
  let [_, v] = iterable(coll);
  return v;
}
// second([1, 2, 3]);
// 2
// second("abc");
// "b"
// second({name: "George", weight: 100})
// "weight", 100

export function ffirst(coll) {
  return first(first(coll));
}
// ffirst({name: "George", weight: 100})
// "name"

function assocBang(coll, key, val, ...kvs) {
  if (kvs.length % 2 !== 0) {
    throw new Error('Illegal argument: assoc expects an odd number of arguments.');
  }

  switch (typeConst(coll)) {
    case MAP_TYPE:
      coll.set(key, val);

      for (let i = 0; i < kvs.length; i += 2) {
        coll.set(kvs[i], kvs[i + 1]);
      }
      break;
    case ARRAY_TYPE:
    case OBJECT_TYPE:
      coll[key] = val;

      for (let i = 0; i < kvs.length; i += 2) {
        coll[kvs[i]] = kvs[i + 1];
      }
      break;
    default:
      throw new Error(
        'Illegal argument: assoc! expects a Map, Array, or Object as the first argument.'
      );
  }

  return coll;
}
// var someData = [1, 2, 5, 6, 8, 9];
// assocBang(someData, 0, 77);
// [ 77, 2, 5, 6, 8, 9 ]

// -------------------------//
//------- Utilities --------//
// -------------------------//
export function plus(...xs) {
  return xs.reduce((x, y) => x + y, 0);
}
// plus(1, 2, 3);
// 6

export function minus(...xs) {
  return xs.reduce((x, y) => x - y);
}
// minus(5, 1, 2);
// 2

export function identity(x) {
  return x;
}
// identity([1]);
// [ 1 ]

export function inc(n) {
  return n + 1;
}
// inc(5);
// 6

export function dec(n) {
  return n - 1;
}
// dec(5);
// 4

export function println(...args) {
  console.log(...args);
}
// println("Hello", "world");
// (out) Hello world

export function nth(coll, index, orElse) {
  if (coll) {
    var element = coll[index];

    if (element !== undefined) {
      return element;
    }
  }
  return orElse;
}
// nth([1, 2, 3], 2, null)
// 3

export function str(...xs) {
  return xs.join("");
}
// str("Hello", " world");
// 'Hello world'

export function not(expr) {
  return !expr;
}
// not(true);
// false

export function isNil(val) {
  return val === null;
}
// isNil(null);
// true
// isNil(false);
// false
// isNil(true);
// false

export function subvec(arr, start, end) {
  return arr.slice(start, end);
}
// subvec([1, 2, 3, 4], 1, 3);
// [ 2, 3 ]

export function vector(...args) {
  return args;
}
// vector(1, 2, 3);
// [ 1, 2, 3 ]

export function apply(f, ...args) {
  var xs = args.slice(0, args.length - 1);
  var coll = args[args.length - 1];

  return f(...xs, ...coll);
}
// apply(str, ["str1", "str2", "str3"]);
// 'str1str2str3'

export function isEven(x) {
  return x % 2 === 0;
}
// isEven(2);
// true

export function isOdd(x) {
  return not(isEven(x));
}
isOdd(2);
// false

export function complement(f) {
  return (...args) => not(f(...args));
}
// var testIsOdd = complement(isEven);
// testIsOdd(3);
// true

export function isIdentical(x, y) {
  return x === y;
}
// isIdentical(1, 1);
// true

export function partial(f, ...xs) {
  return function (...args) {
    return f(...xs, ...args);
  };
}
// var hundredPlus = partial(plus, 100);
// hundredPlus(5);
// 105

export function reverse(arr) {
  return arr.reverse();
}
// reverse([1, 2, 3]);
// [ 3, 2, 1 ]

export function sort(f, coll) {
  if (coll === undefined) {
    coll = f;
    f = undefined;
  }
  return [...coll].sort(f);
}
sort([3, 4, 1, 2]);
// [ 1, 2, 3, 4 ]

export function shuffle(coll) {
  return [...coll].sort(function (a, b) {
    return Math.random() - 0.5;
  });
}
// shuffle([1, 2, 3, 4]);
// [ 1, 3, 4, 2 ]

export function randInt(n) {
  return Math.floor(Math.random() * n);
}
// randInt(10);
// 4

export function isTrue(x) {
  return x === true;
}
// isTrue(true);
// true

export function isFalse(x) {
  return x === false;
}
// isFalse(false);
// true

export function isSome(x) {
  return not(x === null || x === undefined);
}
// isSome(true);
// true

export function booleans(x) {
  return !!x;
}
// booleans("hello");
// true

export function isZero(x) {
  return x === 0;
}
// isZero(3);
// false

export function isNeg(x) {
  return x < 0;
}
// isNeg(-5);
// true

function isPos(x) {
  return x > 0;
}
// isPos(5);
// true

// -------------------------//
//---- Threading macros ----//
// -------------------------//
export function threadFirst(value, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), value);
}
// threadFirst("3", parseInt);
// thread("3", parseInt);

export function threadLast(value, ...fns) {
  return fns.reduceRight((acc, fn) => fn(acc), value);
}
// threadLast("3", parseInt);
// thread("3", parseInt);
