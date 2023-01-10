/*
fc-js (functional-core-js) is based on Squint (https://github.com/squint-cljs/squint) 
with some modifications to make the library friendlier to use directly in 
JavaScript projects.

*/

// Data types

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

/*
Internal function
typeConst() returns data type based by checking the object. 

typeConst([1, 2, 3]);
2

typeConst({name: "George", occupation: "Cat"});
3

*/
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

/*
List creates something similar to a Clojure's List structure using JavaScript arrays

It's useful to have a seperate structure because the lists behave differently to
vectors in some functions

new List(1, 2, 3);
List(3) [ 1, 2, 3 ]

*/
class List extends Array {
  constructor(...args) {
    super();
    this.push(...args);
  }
}

// Seqs

/*
isSeqable returns true if the seq function is supported for x

isSeqable("hello");
true

*/
export function isSeqable(x) {
  return (
    typeof x === "string" ||
    x === null ||
    x === undefined ||
    Symbol.iterator in x
  );
}

/*
Internal function
iterable() ensures x can be iterated

iterable(null);
[]

iterable("abc");
"abc"

iterable({ name: "George", occupation: "pet" });
[
  ["name", "George"],
  ["occupation", "pet"],
];

*/
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

/* 
Internal function
iterator([1, 2, 3]);

Object [Array Iterator] {}

*/
function iterator(coll) {
  return coll[Symbol.iterator]();
}

/*
seq() returns a sequence on the collection. If the collection is empty, returns null.
Seq works with strings.

seq(null);
null

seq("");
null

seq([1, 2]);
[ 1, 2 ]

seq({ name: "George", occupation: "Sofa tester" });
[
  ["name", "George"],
  ["occupation", "Sofa tester"],
];

*/
export function seq(x) {
  let iter = iterable(x);

  if (iter.length === 0 || iter.size === 0) {
    return null;
  }
  return iter;
}

/*
Enables lazy evaluation of sequences
*/
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

// Collections

/*
rest() returns a LazyIterable collection containing a possibly empty seq of the items 
after the first

rest([1, 2, 3]);
LazyIterable {
  gen: [GeneratorFunction (anonymous)],
  [Symbol(Iterable)]: true
}

[...rest([1, 2, 3])];
[ 2, 3 ]

[...rest([1])]
[]

[...rest(null)];
[]

*/
export function rest(coll) {
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

/* 
first() returns the first item of collection 

first([1, 2, 3]);
1

first("abc");
"a"

first([]);
null

first({name: "George", weight: 100})
["name", "George"]
*/
export function first(coll) {
  let [first] = iterable(coll);

  return first || null;
}


/*
second() returns the second item of a collection

second([1, 2, 3]);
2

second("abc");
"b"

second({name: "George", weight: 100})
"weight", 100

second([1]);
null

second([]);
null

*/
export function second(coll) {
  let [_, v] = iterable(coll);

  return v || null;
}

/*
ffirst() is the same as first(first(coll))

ffirst({name: "George", weight: 100})
"name"

*/
export function ffirst(coll) {
  return first(first(coll));
}

/*
Mutator
assocBang() adds a value to a structure by mutating the original

var someData = [1, 2, 5, 6, 8, ];
assocBang(someData, 0, 77);
[ 77, 2, 5, 6, 8, 9 ]

*/
export function assocBang(coll, key, val, ...kvs) {
  if (kvs.length % 2 !== 0) {
    throw new Error(
      "Illegal argument: assoc expects an odd number of arguments."
    );
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
        "Illegal argument: assoc! expects a Map, Array, or Object as the first argument."
      );
  }

  return coll;
}

// Utilities

/*
plus() returns the sum of numbers

plus(1, 2, 3);
6

*/
export function plus(...xs) {
  return xs.reduce((x, y) => x + y, 0);
}

/*
minus() returns the subtraction of numbers 

minus(5, 1, 2);
2

*/
export function minus(...xs) {
  return xs.reduce((x, y) => x - y);
}

/*
identity() returns its argument

identity([1]);
[ 1 ]

*/
export function identity(x) {
  return x;
}

/*
inc() returns a number one greater than n

inc(5);
6

*/
export function inc(n) {
  return n + 1;
}

/*
dec() returns a number one less than n

dec(5);
4

*/
export function dec(n) {
  return n - 1;
}

/*
println() is a wrapper for console.log()

println("Hello", "world");
(out) Hello world

*/
export function println(...args) {
  console.log(...args);
}


/*
nth() returns the value at the index

nth(["a", "b", "c", "d"], 0);
"a"

nth([1, 2, 3], 2, null)
3

nth([], 0);
undefined

nth([], 0, "nothing found");
"nothing found"

nth ([0, 1, 2], 77, 1337);
1337

*/
export function nth(coll, index, notFound) {
  if (coll) {
    var element = coll[index];

    if (element !== undefined) {
      return element;
    }
  }
  return notFound;
}

/*
str() returns a string for single values and a concatenation of multiple values

str()
""

str(null)
""

str(1);
"1"

str(1, 2, 3);
"123"

str("L", 5, "a");
"L5a"

*/
export function str(...xs) {
  return xs.join("");
}

/*
not() returns true if x is logical false, false otherwise

not(true);
false

not(false);
true

not(null);
true

not(undefined);
true

not(1);
false

*/
export function not(x) {
  return !x;
}

/*
isNil() returns true if x is null, false otherwise

isNil(null);
true

isNil(false);
false

isNil(true);
false

*/
export function isNil(x) {
  return x === null;
}

/*
subvec() returns an array of the items in an array from start to end

subvec([1, 2, 3, 4, 5, 6, 7], 2);
[ 3, 4, 5, 6, 7 ]

subvec([1, 2, 3, 4, 5, 6, 7], 2, 4);
[ 3, 4 ]

*/
export function subvec(arr, start, end) {
  return arr.slice(start, end);
}

/*
vector() creates a new array containing args

vector();
[]

vector(null);
[ null ]

vector(1, 2, 3);
[ 1, 2, 3 ]

*/
export function vector(...args) {
  return args;
}

/*
apply() applies fn f to the argument list formed by prepending intervening 
arguments to args

apply(str, ["str1", "str2", "str3"]);
"str1str2str3"

*/
export function apply(f, ...args) {
  var xs = args.slice(0, args.length - 1);
  var coll = args[args.length - 1];

  return f(...xs, ...coll);
}

/*
isEven() returns true if x is even

isEven(2);
true

isEven(null);
Error

*/
export function isEven(x) {
  if (typeof x !== "number") {
    throw new Error(
      `Illegal argument: ${x} is not a number`
    );
  }

  return x % 2 === 0;
}

/*
isOdd() returns true if x is odd

isOdd(3);
true

isOdd(null);
Error

*/
export function isOdd(x) {
  return not(isEven(x));
}

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
// Reverse items in an array
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

// Threading (pipe) functions

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
