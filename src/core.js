/*
Core data types

*/
const MAP_TYPE = 1;
const ARRAY_TYPE = 2;
const OBJECT_TYPE = 3;
const LIST_TYPE = 4;
const SET_TYPE = 5;
const LAZY_ITERABLE_TYPE = 6;
const BOOLEAN_TYPE = 7;
const NUMBER_TYPE = 8;
const STRING_TYPE = 9;
const FUNCTION_TYPE = 10;

/*
Internal function
emptyOfType() returns a new empty collection based on type

*/
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

function typePrimitive(obj) {
  if (typeof obj === "boolean") {
    return BOOLEAN_TYPE;
  }

  if (typeof obj === "number") {
    return NUMBER_TYPE;
  }

  if (typeof obj === "string") {
    return STRING_TYPE;
  }

  if (typeof obj === "function") {
    return FUNCTION_TYPE;
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
export class List extends Array {
  constructor(...args) {
    super();
    this.push(...args);
  }
}

/*
isList() checks if x is a List

isList(new List(1, 2, 3));
true

isList("hello");
false

*/
export function isList(x) {
  return typeConst(x) === LIST_TYPE;
}

/*
list() creates a new List containing args

list("a", "b", "c");
List(3) [ 'a', 'b', 'c' ]

list(1, 2, 3);
List(3) [ 1, 2, 3 ]

*/
export function list(...args) {
  return new List(...args);
}

/*
concat() returns a lazy sequence of the concatenation of elements in
colls

[...concat([1, 2], [3, 4])];
[ 1, 2, 3, 4 ]

[...concat(["a", "b"], null, [1, [2, 3], 4])];
[ 'a', 'b', 1, [ 2, 3 ], 4 ]


*/
export function concat(...colls) {
  return lazy(function* () {
    for (const coll of colls) {
      yield* iterable(coll);
    }
  });
}

/*
mapcat() returns a LazyIterable of applying concat to the result of 
applying map to f and colls

[...mapcat(reverse, [[3, 2, 1, 0], [6, 5, 4], [9, 8, 7]])];
[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

[...mapcat(list, ["a", "b", "c"], [1, 2, 3])];
[ "a", 1, "b", 2, "c", 3 ]

*/
export function mapcat(f, ...colls) {
  return concat(...map(f, ...colls));
}

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
iterable() returns an iterable of x, even if it's empty allowing for
nil punning

iterable(null);
[]

iterable("abc");
"abc"

*/
export function iterable(x) {
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
Internal function. See https://github.com/squint-cljs/squint/issues/22
iterator([1, 2, 3]);

Object [Array Iterator] {}

*/
function iterator(coll) {
  return coll[Symbol.iterator]();
}

/*
seq() takes a collection and returns an iterable of that collection, or nil if
it's empty.

seq([1, 2]);
[ 1, 2 ]

seq(null);
null

*/
export function seq(x) {
  var iter = iterable(x);

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

/*
Internal function
lazy() returns a new instance of LazyIterable

*/
function lazy(f) {
  return new LazyIterable(f);
}

/*
cons() returns a new LazyIterable where x is the first item and
coll is the rest

[...cons(1, [2, 3, 4, 5, 6])];
[ 1, 2, 3, 4, 5, 6 ]

[...cons([1, 2], [4, 5, 6])];
[ [ 1, 2 ], 4, 5, 6 ]

*/
export function cons(x, coll) {
  return lazy(function* () {
    yield x;
    yield* iterable(coll);
  });
}

/*
map() applies a given function to each element of a collection

[...map(inc, [1, 2, 3, 4, 5])];
[ 2, 3, 4, 5, 6 ]

[...map(last, {x: 1, y: 2, z: 3})];
[ 1, 2, 3 ]

*/
export function map(f, ...colls) {
  switch (colls.length) {
    case 0:
      throw new Error("map with one argument is not supported");
    case 1:
      return lazy(function* () {
        for (const x of iterable(colls[0])) {
          yield f(x);
        }
      });
    default:
      return lazy(function* () {
        const iters = colls.map((coll) => iterator(iterable(coll)));

        while (true) {
          let args = [];
          for (const i of iters) {
            const nextVal = i.next();

            if (nextVal.done) {
              return;
            }

            args.push(nextVal.value);
          }

          yield f(...args);
        }
      });
  }
}

/*
filter() returns a lazy sequence of the items in coll for which
pred(item) returns true

[...filter(isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
[ 0, 2, 4, 6, 8, 10 ]

*/
export function filter(pred, coll) {
  return lazy(function* () {
    for (const x of iterable(coll)) {
      if (pred(x)) {
        yield x;
      }
    }
  });
}

/*
filterv() returns an array of the items in coll for which
pred(item) returns true

filterv(isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
[ 0, 2, 4, 6, 8, 10 ]

*/
export function filterv(pred, coll) {
  return [...filter(pred, coll)];
}

/*
remove() returns a lazy sequence of the items in coll for which
pred(item) returns false

[...remove(isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
[ 1, 3, 5, 7, 9 ]

*/
export function remove(pred, coll) {
  return filter(complement(pred), coll);
}

/*
mapIndexed() returns an array of the result of applying f to 0 and the first 
item of coll, followed by applying f to 1 and the second item in the coll etc

mapIndexed(function (index, item) {
  return [index, item];
}, "foobar");
[ [0, "f"], [1, "o"], [2, "o"], [3, "b"], [4, "a"], [5, "r"] ];

*/
export function mapIndexed(f, coll) {
  let ret = [];
  let i = 0;

  for (const x of iterable(coll)) {
    ret.push(f(i, x));
    i++;
  }

  return ret;
}

/*
rest() returns a LazyIterable collection containing a possibly empty seq of the items 
after the first

[...rest([1, 2, 3])];
[ 2, 3 ]

[...rest(null)];
[]

*/
export function rest(coll) {
  return lazy(function* () {
    var first = true;

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

*/
export function first(coll) {
  var [first] = iterable(coll);

  return first ?? null;
}

/*
second() returns the second item of a collection

second([1, 2, 3]);
2

*/
export function second(coll) {
  var [_, v] = iterable(coll);

  return v ?? null;
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
last() returns the last item in a collection

last([1, 2, 3, 4, 5]);
5

last({one: 1, two: 2, three: 3});
[ "three", 3 ]

*/
export function last(coll) {
  coll = iterable(coll);

  switch (typeConst(coll)) {
    case ARRAY_TYPE:
      return coll[coll.length - 1] ?? null;
    default:
      let lastEl;
      for (const x of coll) {
        lastEl = x;
      }
      return lastEl;
  }
}

/*
Internal class for reduce()

*/
class Reduced {
  value;
  constructor(x) {
    this.value = x;
  }
  _deref() {
    return this.value;
  }
}

/*
reduced() wraps x so that reduce will terminate with the value x

reduce(function (a, v) {
  return plus(a, v);
}, range(10));
45

*/
export function reduced(x) {
  return new Reduced(x);
}

/*
isReduced() returns true if x is the result of a call to reduced

isReduced("foo");
false

isReduced(reduced("foo"));
true

*/
export function isReduced(x) {
  return x instanceof Reduced;
}

/*
reduce() iterates over a collection and applies a function to each
element, returning a single result

reduce(plus, [1, 2, 3, 4, 5]);
15

reduce(plus, [1]);
1

*/
export function reduce(f, arg1, arg2) {
  let coll, val;

  // TODO: fix in upstream
  if (arg1.length === 0 && arg2 === undefined) {
    return f();
  }

  if (arg2 === undefined) {
    // reduce(f, coll)
    let iter = iterable(arg1)[Symbol.iterator]();
    val = iter.next().value;
    coll = iter;
  } else {
    // reduce(f, val, coll)
    val = arg1;
    coll = iterable(arg2);
  }

  if (val instanceof Reduced) {
    return val.value;
  }

  for (const x of coll) {
    val = f(val, x);

    if (val instanceof Reduced) {
      val = val.value;
      break;
    }
  }

  return val;
}

/*
Mutator
mutAssoc() adds a value to a structure by mutating the original

var arrData = [1, 2, 5, 6, 8, 9];
mutAssoc(someData, 0, 77);
[ 77, 2, 5, 6, 8, 9 ]

*/
export function mutAssoc(coll, key, val, ...kvs) {
  if (kvs.length % 2 !== 0) {
    throw new Error(
      "Illegal argument: assoc expects an odd number of arguments."
    );
  }

  switch (typeConst(coll)) {
    case MAP_TYPE:
      coll.set(key, val);

      for (var i = 0; i < kvs.length; i += 2) {
        coll.set(kvs[i], kvs[i + 1]);
      }
      break;
    case ARRAY_TYPE:
    case OBJECT_TYPE:
      coll[key] = val;

      for (var i = 0; i < kvs.length; i += 2) {
        coll[kvs[i]] = kvs[i + 1];
      }
      break;
    default:
      throw new Error(
        "Illegal argument: assoc! expects a Map, Array or Object as the first argument."
      );
  }

  return coll;
}

/*
assoc() returns a new structure with a modified values

assoc([1, 2, 5, 6, 8, 9], 0, 77);
[ 77, 2, 5, 6, 8, 9 ]

*/
export function assoc(coll, key, val, ...kvs) {
  if (!coll) {
    coll = {};
  }

  switch (typeConst(coll)) {
    case MAP_TYPE:
      return mutAssoc(new Map(coll.entries()), key, val, ...kvs);
    case ARRAY_TYPE:
      return mutAssoc([...coll], key, val, ...kvs);
    case OBJECT_TYPE:
      return mutAssoc({ ...coll }, key, val, ...kvs);
    default:
      throw new Error(
        "Illegal argument: assoc expects a Map, Array or Object as the first argument."
      );
  }
}

/*
Internal function
assocInWith() allows for modification (mutation or copy) of nested structures

*/
function assocInWith(f, fname, coll, keys, val) {
  var baseType = typeConst(coll);

  if (
    baseType !== MAP_TYPE &&
    baseType !== ARRAY_TYPE &&
    baseType !== OBJECT_TYPE
  ) {
    throw new Error(
      `Illegal argument: ${fname} expects a Map, Array or Object as the first argument.`
    );
  }

  const chain = [coll];
  var lastInChain = coll;

  for (var i = 0; i < keys.length - 1; i += 1) {
    var k = keys[i];
    var chainVal;

    if (lastInChain instanceof Map) {
      chainVal = lastInChain.get(k);
    } else {
      chainVal = lastInChain[k];
    }

    if (!chainVal) {
      chainVal = emptyOfType(baseType);
    }

    chain.push(chainVal);

    lastInChain = chainVal;
  }

  chain.push(val);

  for (var i = chain.length - 2; i >= 0; i -= 1) {
    chain[i] = f(chain[i], keys[i], chain[i + 1]);
  }

  return chain[0];
}

/*
Mutator
mutAssocIn() associates a value in a nested structure by mutating value

var pets = [{name: "George", age: 12}, {name: "Lola", age: 11}];

mutAssocIn(pets, [0, "age"], 13);
pets
[ { name: "George", age: 13 }, { name: "Lola", age: 11 } ];

*/
export function mutAssocIn(coll, keys, val) {
  return assocInWith(mutAssoc, "assocIn!", coll, keys, val);
}

/*
assocIn() associates a value in a nested structure. It returns a new structure

assocIn([{name: "George", age: 12}, {name: "Lola", age: 11}], [0, "age"], 13);
[
  { name: "George", age: 13 },
  { name: "Lola", age: 11 },
];

*/
export function assocIn(coll, keys, val) {
  return assocInWith(assoc, "assocIn", coll, keys, val);
}

/*
Mutator
mutDissoc removes item(s) from an object by key name

var dissocObj = {name: "George", salary: "Biscuits"};
mutDissoc(dissocObj, "name", "salary");
{}
  
*/
export function mutDissoc(obj, ...keys) {
  for (const key of keys) {
    delete obj[key];
  }

  return obj;
}

/*
dissoc returns a copy of an object with item(s) removed by key name

dissoc({name: "George", salary: "Biscuits"}, "name", "salary");
{}

*/
export function dissoc(obj, ...keys) {
  let obj2 = { ...obj };

  for (const key of keys) {
    delete obj2[key];
  }

  return obj2;
}

/*
comp() takes a set of functions and returns a fn that is the composition
of those fns

comp(isZero)(5);
false

comp(str, plus)(8, 8, 8);
"24"

*/
export function comp(...fs) {
  if (fs.length === 0) {
    return identity;
  } else if (fs.length === 1) {
    return fs[0];
  }

  var [f, ...more] = fs.slice().reverse();

  return function (...args) {
    var x = f(...args);
    for (const g of more) {
      x = g(x);
    }

    return x;
  };
}

/*
Mutator
mutConj() (conjoin) adds to a structure by mutation. The position of the addition
depends on the structure type

mutConj([1, 2, 3], 4);
[ 1, 2, 3, 4 ]

mutConj({name: "George", coat: "Tabby"}, {age: 12, nationality: "British"})
{ name: 'George', coat: 'Tabby', age: 12, nationality: 'British' }

*/
export function mutConj(...xs) {
  if (xs.length === 0) {
    return vector();
  }

  var [coll, ...rest] = xs;

  if (coll === null || coll === undefined) {
    coll = [];
  }

  switch (typeConst(coll)) {
    case SET_TYPE:
      for (const x of rest) {
        coll.add(x);
      }
      break;
    case LIST_TYPE:
      coll.unshift(...rest.reverse());
      break;
    case ARRAY_TYPE:
      coll.push(...rest);
      break;
    case MAP_TYPE:
      for (const x of rest) {
        if (!(x instanceof Array))
          iterable(x).forEach((kv) => {
            coll.set(kv[0], kv[1]);
          });
        else coll.set(x[0], x[1]);
      }
      break;
    case OBJECT_TYPE:
      for (const x of rest) {
        if (!(x instanceof Array)) {
          Object.assign(coll, x);
        } else {
          coll[x[0]] = x[1];
        }
      }
      break;
    default:
      throw new Error(
        "Illegal argument: conj! expects a Set, Array, List, Map, or Object as the first argument."
      );
  }

  return coll;
}

/*
conj() (conjoin) adds to a structure and returns a copy. The position of the 
addition depends on the structure type

conj([1, 2, 3], 4);
[ 1, 2, 3, 4 ]

conj([1, 2, 3], 4, 5);
[ 1, 2, 3, 4, 5 ]

*/
export function conj(...xs) {
  if (xs.length === 0) {
    return vector();
  }

  let [coll, ...rest] = xs;

  if (coll === null || coll === undefined) {
    coll = [];
  }

  switch (typeConst(coll)) {
    case SET_TYPE:
      return new Set([...coll, ...rest]);
    case LIST_TYPE:
      return new List(...rest.reverse(), ...coll);
    case ARRAY_TYPE:
      return [...coll, ...rest];
    case MAP_TYPE:
      const m = new Map(coll);

      for (const x of rest) {
        if (!(x instanceof Array))
          iterable(x).forEach((kv) => {
            m.set(kv[0], kv[1]);
          });
        else m.set(x[0], x[1]);
      }

      return m;
    case LAZY_ITERABLE_TYPE:
      return lazy(function* () {
        yield* rest;
        yield* coll;
      });
    case OBJECT_TYPE:
      const coll2 = { ...coll };

      for (const x of rest) {
        if (!(x instanceof Array)) {
          Object.assign(coll2, x);
        } else {
          coll2[x[0]] = x[1];
        }
      }

      return coll2;
    default:
      throw new Error(
        "Illegal argument: conj expects a Set, Array, List, Map, or Object as the first argument."
      );
  }
}

/*
Mutator
mutDisj() removes item(s) from a set via mutation

var disjSet = new Set(["a", "b", "c"]);
mutDisj(disjSet, "b");
Set(2) { 'a', 'c' }

*/
export function mutDisj(set, ...xs) {
  for (const x of xs) {
    set.delete(x);
  }
  return set;
}

/*
disj() returns a new copy of a set with item(s) removed

disj(new Set(["a", "b", "c"]), "b");
Set(2) { 'a', 'c' }

*/
export function disj(set, ...xs) {
  let set1 = new Set([...set]);
  return mutDisj(set1, ...xs);
}

/*
itContains() returns true if key is present in the given collection,
otherwise false. For arrays the key is the index.

itContains({name: "George", salary: "Biscuits"}, "name");
true

*/
export function itContains(coll, val) {
  switch (typeConst(coll)) {
    case SET_TYPE:
    case MAP_TYPE:
      return coll.has(val);
    case undefined:
      return false;
    default:
      return val in coll;
  }
}

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
divide() returns the division of numbers

divide(6, 3);
2

divide(10);
0.1

divide(6, 3, 2);
1

divide(1, 3);
0.3333333333333333

divide();
// error

divide(1, 0);
Infinity

divide(43.0, 2);
21.5

*/
export function divide(...xs) {
  if (xs.length === 0) {
    throw new Error(`Illegal arity: 0 args passed to divide`);
  }

  if (xs.length === 1) {
    return 1 / xs;
  }

  return xs.reduce((x, y) => x / y);
}

/*
quot() returns the quotient of dividing numerator by denominator

quot(10, 3);
3

quot(11, 3);
3

quot(12, 3);
4

*/
export function quot(a, b) {
  return Math.floor(a / b);
}

/*
multiply() returns the product of numbers

multiply();
1

multiply(6);
6

multiply(2, 3);
6

multiply(2, 3, 4);
24

multiply(0.5, 200);
100

multiply(8, 0.5);
4

*/
export function multiply(...xs) {
  return xs.reduce((x, y) => x * y, 1);
}

/*
gt() returns true if numbers are in decreasing order, otherwise false

gt(1, 2);
false

gt(2, 1);
true

gt(2, 2);
false

gt(6, 5, 4, 3, 2)
true

gt(6, 5, 4, 3, 2, 4)
false

gt(6, 3, 1)
true

*/
export function gt(...xs) {
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i] <= xs[i + 1]) {
      return false;
    }
  }
  return true;
}

/*
lt() returns true if numbers are in decreasing order, otherwise false

lt(1, 2);
true

lt(2, 1);
false

lt(2, 2);
false

lt(1.5, 2);
true

lt(2, 3, 4, 5, 6);
true

lt(1, 0.5);
false

lt(2, 3, 4, 5, 6, 1);
false

*/
export function lt(...xs) {
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i] >= xs[i + 1]) {
      return false;
    }
  }

  return true;
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
interleave() returns a lazy sequence of the first item in each coll,
then the second etc

[...interleave(["a", "b", "c"], [1, 2, 3])];
[ 'a', 1, 'b', 2, 'c', 3 ]

*/
export function interleave(...colls) {
  return lazy(function* () {
    const iters = colls.map((coll) => iterator(iterable(coll)));

    while (true) {
      let res = [];
      for (const i of iters) {
        const nextVal = i.next();

        if (nextVal.done) {
          return;
        }

        res.push(nextVal.value);
      }

      yield* res;
    }
  });
}

/*
interpose() returns a lazy sequence of the elements of coll separated
by sep

[...interpose(", ", ["one", "two", "three"])];
[ "one", ", ", "two", ", ", "three" ]

*/
export function interpose(sep, coll) {
  return drop(1, interleave(repeat(sep), coll));
}

/*
selectKeys() returns a map containing only those entries in the map
whose key is in keys

selectKeys({a: 1, b: 2}, ["a"]);
{ a: 1 }

*/
export function selectKeys(coll, keys) {
  const type = typeConst(coll);

  const ret = emptyOfType(type);

  for (const key of keys) {
    const val = get(coll, key);

    if (val !== undefined && val !== null) {
      mutAssoc(ret, key, val);
    }
  }

  return ret;
}

/*
Internal function
_partition() is a helper function for partition and partitionAll

*/
function _partition(n, step, pad, coll, all) {
  return lazy(function* () {
    let p = [];
    let i = 0;

    for (let x of iterable(coll)) {
      if (i < n) {
        p.push(x);

        if (p.length === n) {
          yield p;
          p = step < n ? p.slice(step) : [];
        }
      }

      i++;

      if (i === step) {
        i = 0;
      }
    }

    if (p.length > 0) {
      if (p.length === n || all) {
        yield p;
      } else if (pad.length) {
        p.push(...pad.slice(0, n - p.length));
        yield p;
      }
    }
  });
}

/*
partition() returns a lazy sequence of n items each at offsets
step apart

[...partition(4, range(20))];
[ [ 0, 1, 2, 3 ], [ 4, 5, 6, 7 ], [ 8, 9, 10, 11 ], [ 12, 13, 14, 15 ], [ 16, 17, 18, 19 ] ]

*/
export function partition(n, ...args) {
  let step = n;
  let pad = [];
  let coll = args[0];

  if (args.length === 2) {
    [step, coll] = args;
  } else if (args.length > 2) {
    [step, pad, coll] = args;
  }

  return _partition(n, step, pad, coll, false);
}

/*
partitionAll() returns a lazy sequence of arrays like partition but
may include partitions with fewer than n items at the end

[...partitionAll(4, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
[ [ 0, 1, 2, 3 ], [ 4, 5, 6, 7 ], [ 8, 9 ] ]

*/
export function partitionAll(n, ...args) {
  let step = n;
  let coll = args[0];

  if (args.length === 2) {
    [step, coll] = args;
  }

  return _partition(n, step, [], coll, true);
}

/*
empty() returns an empty coll of the same category as coll or null

empty(list(1, 2));
List(0) []

*/
export function empty(coll) {
  const type = typeConst(coll);

  return emptyOfType(type);
}

/*
merge() returns an object that consists of the rest of the maps
conjed onto the first

merge({a: 1, b: 2, c: 3}, {b: 9, d: 4});
{ a: 1, b: 9, c: 3, d: 4 }

*/
export function merge(...args) {
  const firstArg = args[0];
  let obj;

  if (first === null || firstArg === undefined) {
    obj = {};
  } else {
    obj = into(empty(firstArg), firstArg);
  }
  return mutConj(obj, ...args.slice(1));
}

/*
into() returns a new coll containing values from colls conjoined

into([], [1, 2, 3]);
[ 1, 2, 3 ]

*/
export function into(...args) {
  switch (args.length) {
    case 0:
      return [];
    case 1:
      return args[0];
    default:
      return conj(args[0] ?? [], ...iterable(args[1]));
  }
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
get() returns the value mapped to key, notFound or null if the key 
is not present

get([1, 2, 3], 1);
2

*/
export function get(coll, key, notFound = null) {
  let val;

  switch (typeConst(coll)) {
    case SET_TYPE:
      if (coll.has(key)) {
        val = key;
        break;
      }
    case MAP_TYPE:
      val = coll.get(key);
      break;
    case undefined:
      break;
    default:
      val = coll[key];
      break;
  }

  if (val !== undefined) {
    return val;
  }

  return notFound;
}

/*
str() returns a string for single values and a concatenation of multiple values

str(1);
"1"

str(1, 2, 3);
"123"

*/
export function str(...xs) {
  return xs.join("");
}

/*
not() returns true if x is logical false, false otherwise

not(true);
false

*/
export function not(x) {
  return !x;
}

/*
isNil() returns true if x is null, false otherwise

isNil(null);
true

*/
export function isNil(x) {
  return x === null;
}

function prStr1(x) {
  return JSON.stringify(x, (_key, val) => {
    switch (typeConst(val)) {
      case SET_TYPE:
      case LAZY_ITERABLE_TYPE:
        return [...val];
      case MAP_TYPE:
        return Object.fromEntries(val);
      default:
        return val;
    }
  });
}

/*
prStr() turns a collection into a string and returns it

prStr([1, 2, 3, 4, 5]);
"[1,2,3,4,5]"

prStr({name: "George", salary: "Biscuits"});
"{"name":"George","salary":"Biscuits"}"

*/
export function prStr(...xs) {
  return xs.map(prStr1).join("");
}

/*
prn() turns a collectin into a string and prints to console
returns undefined

prn([1, 2, 3, 4, 5]);
"[1,2,3,4,5]"

prn({name: "George", salary: "Biscuits"});
"{"name":"George","salary":"Biscuits"}"

*/
export function prn(...xs) {
  println(prStr(...xs));
}

function Atom(init) {
  this.value = init;
  this._deref = () => this.value;
  this._mutReset = (x) => (this.value = x);
}

/*
Atoms provide a way to manage shared, synchronous, independent
state

var myAtom = atom(0);
myAtom;
Atom {
  value: 0,
  _deref: [Function (anonymous)],
  _mutReset: [Function (anonymous)]
}

myAtom.value;
0

mutSwap(myAtom, inc);
1

mutSwap(myAtom, function(n) { return (n + n) * 2 });
4

mutReset(myAtom, 0);

myAtom.value;
0

*/
export function atom(init) {
  return new Atom(init);
}

export function deref(ref) {
  return ref._deref();
}

export function mutReset(atom, val) {
  atom._mutReset(val);
}

export function mutSwap(atom, f, ...args) {
  const val = f(deref(atom), ...args);
  mutReset(atom, val);

  return val;
}

/*
range() a lazy sequence of numbers from start to end

[...range(10)];
[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

[...range(-5, 5)];
[ -5, -4, -3, -2, -1, 0,  1,  2,  3,  4 ]

*/
export function range(begin, end, step) {
  return lazy(function* () {
    let b = begin;
    let e = end;
    let s = step;

    if (end === undefined) {
      b = 0;
      e = begin;
    }

    let i = b || 0;
    s = step || 1;

    while (e === undefined || i < e) {
      yield i;
      i += s;
    }
  });
}

/*
reMatches() returns the match, if any, of string to pattern using
RegExp.prototype.exec()

reMatches(/hello, world/gi, "hello, world");
'hello, world'

reMatches(/quick\s(?<color>brown).+?(jumps)/dgi, "The Quick Brown Fox Jumps Over The Lazy Dog");
[ 'Quick Brown Fox Jumps', 'Brown', 'Jumps' ]

*/
export function reMatches(re, s) {
  let matches = re.exec(s);

  if (matches.length === 1) {
    if (matches && s === matches[0]) {
      return matches[0];
    }
  }

  if (matches.length > 1) {
    return matches.map(function (match) {
      return match;
    });
  }

  return null;
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

vector(1, 2, 3);
[ 1, 2, 3 ]

*/
export function vector(...args) {
  return args;
}

/*
isVector() checks if x is an array

isVector([1, 2, 3]);
true

isVector("hello");
false

*/
export function isVector(x) {
  return typeConst(x) === ARRAY_TYPE;
}

/*
mapv() returns the results of map() in an array

mapv(inc, [1, 2, 3, 4, 5]);
[ 2, 3, 4, 5, 6 ]

*/
export function mapv(...args) {
  return [...map(...args)];
}

/*
vec() creates a new array containing iterable of coll

vec(null);
[]

vec({a: 1, b: 2, c: 3});
[[ "a", 1 ], [ "b", 2 ], [ "c", 3 ]]

*/
export function vec(coll) {
  return [...iterable(coll)];
}

/*
set() returns a set of the distinct elements of coll

set([1, 2, 3, 4, 5]);
Set(5) { 1, 2, 3, 4, 5 }

set("abcd")
Set(4) { 'a', 'b', 'c', 'd' }

*/
export function set(coll) {
  return new Set(iterable(coll));
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
    throw new Error(`Illegal argument: ${x} is not a number`);
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

/*
complement() takes a fn f and returns a fn that takes the same arguments
as f, has the same effects, if any, and returns the opposite truth value

var testIsOdd = complement(isEven);
testIsOdd(3);
true

*/
export function complement(f) {
  return (...args) => not(f(...args));
}

/*
constantly returns a function that takes any number of arguments and returns x

var boring = constantly(10);
boring() 

boring("hello");
10

*/
export function constantly(x) {
  return (..._) => x;
}

/*
isIdentical() tests if two arguments are the equal

isIdentical(1, 1);
true

*/
export function isIdentical(x, y) {
  return x === y;
}

/*
repeat() returns a lazy sequence of args

[...repeat(5, "x")];
[ "x", "x", "x", "x", "x" ]

*/
export function repeat(...args) {
  if (args.length === 0 || args.length > 2) {
    throw new Error(`Invalid arity: ${args.length}`);
  }

  return {
    [IIterable]: true,
    [IIterableIterator]:
      args.length == 1
        ? function* () {
            let x = args[0];
            while (true) {
              yield x;
            }
          }
        : function* () {
            let [n, x] = args;
            for (var i = 0; i < n; i++) {
              yield x;
            }
          },
  };
}

/*
take() returns a lazy sequence of the first n items in coll, or
all items if there are fewer than n

[...take(3, [1, 2, 3, 4, 5, 6])];
[ 1, 2, 3 ]

[...take(3, [1, 2])];
[ 1, 2 ]

*/
export function take(n, coll) {
  return lazy(function* () {
    let i = n - 1;

    for (const x of iterable(coll)) {
      if (i-- >= 0) {
        yield x;
      }

      if (i < 0) {
        return;
      }
    }
  });
}

/*
takeWhile() returns a lazy sequence of successive items from coll
while pred(item) returns true

[...takeWhile(isNeg, [-2, -1, 0, 1, 2, 3])];
[ -2, -1 ]

*/
export function takeWhile(pred, coll) {
  return lazy(function* () {
    for (const x of iterable(coll)) {
      if (pred(x)) {
        yield x;
      } else {
        return;
      }
    }
  });
}

/*
takeNth() returns a lazy sequence of every nth item in coll

[...takeNth(2, range(10))];
[ 0, 2, 4, 6, 8 ]

*/
export function takeNth(n, coll) {
  if (n <= 0) {
    return repeat(first(coll));
  }

  return lazy(function* () {
    let i = 0;

    for (let x of iterable(coll)) {
      if (i % n === 0) {
        yield x;
      }
      i++;
    }
  });
}

/*
partial() takes a function f and fewer than normal arguments to f. It returns a 
fn that takes a variable number of additional args. When called, the
returned function calls f with args plus additional args

var hundredPlus = partial(plus, 100);
hundredPlus(5);
105

*/
export function partial(f, ...xs) {
  return function (...args) {
    return f(...xs, ...args);
  };
}

/*
cycle() returns a lazy sequence of repetitions from items in coll

[...take(5, cycle(["a", "b"]))];
[ 'a', 'b', 'a', 'b', 'a' ]

[...take(10, cycle(range(0, 3)))];
[ 0, 1, 2, 0, 1, 2, 0, 1, 2, 0 ]

*/
export function cycle(coll) {
  return lazy(function* () {
    while (true) {
      yield* coll;
    }
  });
}

/*
reverse() returns an array with items in reverse order

reverse([1, 2, 3]);
[ 3, 2, 1 ]

reverse("hello");
[ "o", "l", "l", "e", "h" ]

*/
export function reverse(coll) {
  if (coll instanceof Array) {
    return coll.reverse();
  } else {
    return [...coll].reverse();
  }
}

/*
sort() returns a sorted sequence of the items in coll

sort([3, 4, 1, 2]);
[ 1, 2, 3, 4 ]

sort((a, b) => b - a, [3, 4, 1, 2]);
[ 4, 3, 2, 1 ]

*/
export function sort(f, coll) {
  if (coll === undefined) {
    coll = f;
    f = undefined;
  }
  return [...coll].sort(f);
}

/*
shuffle() returns a random permutation of coll

shuffle([1, 2, 3, 4]);
[ 2, 1, 3, 4 ]

*/
export function shuffle(coll) {
  return [...coll].sort(function () {
    return Math.random() - 0.5;
  });
}

/*
some() returns the first true value of pred(x) for any x in coll,
otherwise null

some(isEven, [1, 2, 3, 4]);
true

*/
export function some(pred, coll) {
  for (const x of iterable(coll)) {
    const res = pred(x);

    if (res) {
      return res;
    }
  }

  return null;
}

/*
randInt() returns a random integer between 0 and n

randInt(30);
27

randInt(30);
3

*/
export function randInt(n) {
  return Math.floor(Math.random() * n);
}

/*
isTrue() returns true if x is true, false otherwise

isTrue(1 > 0);
true

*/
export function isTrue(x) {
  return x === true;
}

/*
isFalse() returns true if x is false, false otherwise

isFalse(1 > 0);
false

*/
export function isFalse(x) {
  return x === false;
}

/*
isSome() returns true if x is not null or undefined, false otherwise

isSome(1 < 5);
true

*/
export function isSome(x) {
  return not(x === null || x === undefined);
}

/*
booleans() coerces x to a boolean

booleans("hello");
true

booleans(0)
false

*/
export function booleans(x) {
  return !!x;
}

/*
isZero() returns true if x is zero, false otherwise

isZero(3);
false

*/
export function isZero(x) {
  return x === 0;
}

/*
isNeg() returns true if x is less than zero, false otherwise

isNeg(-5);
true

*/
export function isNeg(x) {
  return x < 0;
}

/*
isPos() returns true if x is greater than zero, false otherwise

isPos(5);
true

*/
export function isPos(x) {
  return x > 0;
}

/*
drop() returns a lazy sequence of all but the first n items in coll

[...drop(-1, [1, 2, 3, 4])];
[ 1, 2, 3, 4 ]

[...drop(2, [1, 2, 3, 4])];
[ 3, 4 ]

*/
export function drop(n, xs) {
  return lazy(function* () {
    let iter = iterator(iterable(xs));

    for (let x = 0; x < n; x++) {
      iter.next();
    }

    yield* iter;
  });
}

/*
dropWhile() returns a lazy sequence of the items in coll starting from
the first item for which pred(value) returns false

[...dropWhile((x) => 3 > x, [1, 2, 3, 4, 5, 6])];
[ 3, 4, 5, 6 ]

[...dropWhile((x) => 3 >= x, [1, 2, 3, 4, 5, 6])];
[ 4, 5, 6 ]

*/
export function dropWhile(pred, xs) {
  return lazy(function* () {
    let iter = iterator(iterable(xs));

    while (true) {
      let nextItem = iter.next();

      if (nextItem.done) {
        break;
      }

      let value = nextItem.value;

      if (!pred(value)) {
        yield value;
        break;
      }
    }
    yield* iter;
  });
}

/*
distinct() returns a lazy sequnce of the elements of coll with duplicates removed

[...distinct([1, 2, 1, 3, 1, 4, 1, 5])];
[ 1, 2, 3, 4, 5 ]

*/
export function distinct(coll) {
  return lazy(function* () {
    let seen = new Set();
    for (const x of iterable(coll)) {
      if (!seen.has(x)) {
        yield x;
      }
      seen.add(x);
    }
    return;
  });
}

/*
update() returns a new structure with a value updated by f 

update([1, 2, 3], 0, inc);
[ 2, 2, 3 ]

update([], 0, function(item) { return str("foo", item); });
[ 'foo' ]

*/
export function update(coll, key, f, ...args) {
  return assoc(coll, key, f(get(coll, key), ...args));
}

/*
Mutator
mutUpdate() updates a collection with a value updated by f 

var pet = {name: "George", age: 11};
mutUpdate(pet, "age", inc);
pet
{ name: 'George', age: 12 }

*/
export function mutUpdate(coll, key, f, ...args) {
  const val = get(coll, key);

  return mutAssoc(coll, key, f(val, ...args));
}

/*
groupBy() returns an object of the elements of coll keyed by the
result of f on each element

groupBy(isOdd, range(10));
{ false: [ 0, 2, 4, 6, 8 ], true: [ 1, 3, 5, 7, 9 ] }

*/
export function groupBy(f, coll) {
  const res = {};

  for (const x of iterable(coll)) {
    const key = f(x);
    mutUpdate(res, key, fnil(mutConj, []), x);
  }

  return res;
}

/*
frequencies() returns an object from distinct items in coll
to the number of times they appear

frequencies(["a", "b", "a", "a"]);
{ a: 3, b: 1 }

*/
export function frequencies(coll) {
  const res = {};
  const uf = fnil(inc, 0);

  for (const o of iterable(coll)) {
    mutUpdate(res, o, uf);
  }

  return res;
}

/*
butlast() returns a sequence of all but the last item in coll

butlast([1, 2, 3]);
[ 1, 2 ]

*/
export function butlast(coll) {
  let x = [...iterable(coll)];
  x.pop();

  return x.length > 0 ? x : null;
}

/*
dropLast() returns a lazy sequence of all but the last n items in coll

[...dropLast([1, 2, 3, 4])];
[ 1, 2, 3 ]

*/
export function dropLast(...args) {
  let [n, coll] = args.length > 1 ? args : [1, args[0]];

  return map((x, _) => x, coll, drop(n, coll));
}

/*
splitAt() returns an array of [take(n, coll), drop(n, coll)]

splitAt(2, [1, 2, 3, 4, 5]);
[ [ 1, 2 ], [ 3, 4, 5 ] ]

*/
export function splitAt(n, coll) {
  return [[...take(n, coll)], [...drop(n, coll)]];
}

/*
splitWith() returns an array of [takeWhile(pred, coll), dropWhile(pred, coll)]

splitWith(isOdd, [1, 3, 5, 6, 7, 9]);
[ [ 1, 3, 5 ], [ 6, 7, 9 ] ]

*/
export function splitWith(pred, coll) {
  return [[...takeWhile(pred, coll)], [...dropWhile(pred, coll)]];
}

/*
count() returns the number of items in the collection

count([1, 2, 3]);
3

*/
export function count(coll) {
  if (!coll) {
    return 0;
  }

  const len = coll.length || coll.size;

  if (typeof len === "number") {
    return len;
  }

  let ret = 0;

  for (const x of iterable(coll)) {
    ret++;
  }

  return ret;
}

/*
getIn() returns a selected value from a nested structure

var pet = {
  name: "George",
  profile: {
    name: "George V",
    address: { city: "London", street: "Tabby lane" },
  },
}

getIn(pet, ["profile", "name"]);
'George V'

*/
export function getIn(coll, path, notFound = null) {
  let entry = coll;

  for (const item of path) {
    entry = get(entry, item);
  }

  if (entry === undefined || entry === null) {
    return notFound;
  }

  return entry;
}

/*
updateIn() updates a value in a nested structure

var pets = [{name: "George", age: 11}, {name: "Lola", age: 10}];
updateIn(pets, [1, "age"], inc);
[ { name: 'George', age: 11 }, { name: 'Lola', age: 11 } ]

*/
export function updateIn(coll, path, f, ...args) {
  return assocIn(coll, path, f(getIn(coll, path), ...args));
}

/*
fnil() takes a function f, and returns a function that calls f, replacing
a null first argument to f with the supplied value x

function sayHello(name) {
  return str("Hello ", name);
}

var sayHelloWithDefaults = fnil(sayHello, "world");

sayHelloWithDefaults(null);
'Hello world'

sayHelloWithDefaults("universe");
'Hello universe'

// TODO: fix in upstream to add support for multi-arity

*/
export function fnil(f, ...xs) {
  return function (...args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === null || args[i] === undefined) {
        args[i] = xs[i] || xs[xs.length - 1];
      }
    }

    return apply(f, args);
  };
}

/*
isEvery() returns true if pred(x) is true for every x in coll,
otherwise false

isEvery(isEven, [2, 4, 6]);
true

isEvery(isEven, [1, 2, 3]);
false

*/
export function isEvery(pred, coll) {
  for (let x of iterable(coll)) {
    if (!pred(x)) {
      return false;
    }
  }

  return true;
}

/*
isNotEvery() returns false if pred(x) is true for every x in coll,
otherwise true

isNotEvery(isEven, [2, 4, 6]);
false

isNotEvery(isEven, [1, 2, 3]);
true

*/
export function isNotEvery(pred, coll) {
  return !isEvery(pred, coll);
}

/*
isNotAny() returns false if pred(x) is true for any x in coll,
otherwise true

isNotAny(isOdd, [2, 4, 6]);
true

*/
export function isNotAny(pred, coll) {
  return !some(pred, coll);
}

/*
Internal function
_repeatedly() is a helper for repeatedly()

*/
function _repeatedly(f) {
  return lazy(function* () {
    while (true) {
      yield f();
    }
  });
}

/*
repeatedly() takes a function of no args and returns it with n calls
to it

[...repeatedly(5, () => randInt(11))];
[ 7, 7, 7, 6, 4 ]

*/
export function repeatedly(n, f) {
  if (f === undefined) {
    f = n;
    n = undefined;
  }

  const res = _repeatedly(f);

  if (n) {
    return take(n, res);
  } else {
    return res;
  }
}

/*
keep() returns a lazy sequence of the non-nil results of f(item)

[...keep(isEven, range(1, 10))];
[ false, true,  false, true,  false, true, false, true,  false ]

*/
export function keep(pred, coll) {
  return lazy(function* () {
    for (const x of iterable(coll)) {
      const res = pred(x);

      // TODO: this is different in upstream
      if (res !== null && res !== undefined) {
        yield res;
      }
    }
  });
}

/*
replace() turns collection with any elements equal to a key in smap replaced with the
corresponding val in smap

replace(["zeroth", "first", "second", "third", "fourth"], [0, 2, 4, 0])
[ 'zeroth', 'second', 'fourth', 'zeroth' ]

*/
export function replace(smap, coll) {
  let mapf = coll instanceof Array ? mapv : map;

  return mapf((x) => {
    const repl = smap[x];

    if (repl !== undefined) {
      return repl;
    } else {
      return x;
    }
  }, coll);
}

/*
isEmpty() returns true if coll has no items

isEmpty(list());
true

*/
export function isEmpty(coll) {
  return seq(coll) ? false : true;
}

/*
ifNot() evaluates test. If false evaluates and returns then or
otherwise (if supplied)


ifNot(isEmpty([1, 2]), first([1, 2]));
1

ifNot(isEmpty([]), first([1, 2]));

*/
export function ifNot(test, then, otherwise = null) {
  if (!test) {
    return then;
  }

  return otherwise;
}

/*
isInstance() checks if x is an instance of c

isInstance(String, "hello");
true

isInstance(Number, 5);
true

isInstance(Number, "5");
false

*/
export function isInstance(c, x) {
  var a = typeConst(x);
  var b = typePrimitive(x);

  if (c === Boolean && b === BOOLEAN_TYPE) {
    return typeof x === "boolean";
  }

  if (c === Number && b === NUMBER_TYPE) {
    return typeof x === "number";
  }

  if (c === String && b === STRING_TYPE) {
    return typeof x === "string";
  }

  if (c === Function && b === FUNCTION_TYPE) {
    return typeof x === "function";
  }

  if (
    a === MAP_TYPE ||
    a === ARRAY_TYPE ||
    a === OBJECT_TYPE ||
    a === LIST_TYPE ||
    a === SET_TYPE ||
    a === LAZY_ITERABLE_TYPE
  ) {
    return x instanceof c;
  }

  return false;
}

/*
keys() returns all keys from an object

keys({a: 1, b: 2, c: 3});
[ "a", "b", "c" ]

keys({});
null

keys(null);
null

*/
export function keys(x) {
  if (isEmpty(x)) {
    return null;
  }

  return Object.keys(x);
}

/*
vals() returns all values from an object

vals({a: 1, b: 2, c: 3});
[ 1, 2, 3 ]

vals({});
null

vals(null);
null

*/
export function vals(x) {
  if (isEmpty(x)) {
    return null;
  }

  return Object.values(x);
}

/*
threadFirst() threads x through the fns. Inserts x as the second item in the first
function. It will do the same for following functions.

threadFirst("3", parseInt);
3

*/
export function threadFirst(x, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}

/*
threadLast() threads x through the fns. Inserts x as the last item in the first
function. It will do the same for following functions

threadLast("3", parseInt);
3

*/
export function threadLast(x, ...fns) {
  return fns.reduceRight((acc, fn) => fn(acc), x);
}

/*
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

/*
everyPred() returns true if all predicates are true, false otherwise

everyPred(isNumber, isOdd)(3, 9, 1);
true

everyPred(isNumber, isEven)(3, 9, 1);
false

everyPred(isNumber, isOdd, isPos)(3, 9, 1);
true

*/
export function everyPred(...predicates) {
  return function (...args) {
    for (let i = 0; i < predicates.length; i++) {
      if (!predicates[i](...args)) {
        return false;
      }
    }
    return true;
  };
}

/*
reSeq() returns a lazy sequence of successive matches of pattern
in string 

[...reSeq(/\d/g, "test 5.9.2")];
[ '5', '9', '2' ]

[...reSeq(/\w+/g, "this is the story all about how")];
[ 'this', 'is', 'the',  'story', 'all',  'about', 'how' ]

[...reSeq(/(\S+):(\d+)/g, " RX pkts:18 err:5 drop:48")];
[["pkts:18", "pkts", "18"], ["err:5", "err", "5"], ["drop:48", "drop", "48"]]

*/
export function reSeq(pattern, string) {
  let match;

  return lazy(function* () {
    while ((match = pattern.exec(string))) {
      if (match.length === 1) {
        yield match[0];
      }

      if (match.length > 1) {
        yield match.map(function (match) {
          return match;
        });
      }
    }
  });
}

/*
float() coerces x to a float

float("1.5");
1.5

float(1);
1

float(1.4442);
1.4442

float("hello");
NaN

*/
export function float(x) {
  return parseFloat(x);
}
