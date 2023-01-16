/*
Core data types

*/
const MAP_TYPE = 1;
const ARRAY_TYPE = 2;
const OBJECT_TYPE = 3;
const LIST_TYPE = 4;
const SET_TYPE = 5;
const LAZY_ITERABLE_TYPE = 6;

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
listQmark() checks if x is a List

listQmark(new List(1, 2, 3));
true

listQmark("hello");
false

*/
export function listQmark(x) {
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


[...concat([1], [2], list(3, 4), [5, 6, 7], set([9, 10, 8]))];
[ 1, 2, 3, 4, 5, 6, 7, 9, 10, 8 ]

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

[...mapcat(function(x) { return [x, (2 * x)] }, range(5))]
[ 0, 0, 1, 2, 2, 4, 3, 6, 4, 8]


*/
export function mapcat(f, ...colls) {
  return concat(...map(f, ...colls));
}

/*
seqableQmark returns true if the seq function is supported for x

seqableQmark("hello");
true

*/
export function seqableQmark(x) {
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

  if (seqableQmark(x)) {
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

[...map(function(item) { return item.toUpperCase(); }, "hello")]; 
[ 'H', 'E', 'L', 'L', 'O' ]

var months = ["jan", "feb", "mar"];
var temps = [5, 7, 12];

function unify(month, temp) {
  return {
    month,
    temp
  }
}

[...map(unify, months, temps)];
[
  { month: 'jan', temp: 5 },
  { month: 'feb', temp: 7 },
  { month: 'mar', temp: 12 }
]

[...map(vector, [1, 2, 3, 4], ["a", "b", "c", "d"])]
// [ [ 1, 'a' ], [ 2, 'b' ], [ 3, 'c' ], [ 4, 'd' ] ]

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

[...filter(evenQmark, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
[ 0, 2, 4, 6, 8, 10 ]

[
  ...filter(
    function (key, val) {
      return evenQmark(+key[0]);
    },
    { 1: "a", 2: "b", 3: "c", 4: "d" }
  ),
];
[ [ '2', 'b' ], [ '4', 'd' ] ]

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

filterv(evenQmark, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
[ 0, 2, 4, 6, 8, 10 ]

filterv(
  function (key, val) {
    return evenQmark(+key[0]);
  },
  { 1: "a", 2: "b", 3: "c", 4: "d" }
);
[ [ "2", "b" ], [ "4", "d" ] ]

*/
export function filterv(pred, coll) {
  return [...filter(pred, coll)];
}

/*
remove() returns a lazy sequence of the items in coll for which
pred(item) returns false

[...remove(evenQmark, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
[ 1, 3, 5, 7, 9 ]

[
  ...remove(
    function (key, val) {
      return evenQmark(+key[0]);
    },
    { 1: "a", 2: "b", 3: "c", 4: "d" }
  ),
];
[ [ '1', 'a' ], [ '3', 'c' ] ]

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
[
  [0, "f"],
  [1, "o"],
  [2, "o"],
  [3, "b"],
  [4, "a"],
  [5, "r"],
];

mapIndexed(vector, "foobar");
[
  [0, "f"],
  [1, "o"],
  [2, "o"],
  [3, "b"],
  [4, "a"],
  [5, "r"],
];

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

first([]);
null

first({name: "George", weight: 100})
["name", "George"]
*/
export function first(coll) {
  var [first] = iterable(coll);

  return first ?? null;
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

reduce(function (a, v) {
  if (a < 100) {
    return plus(a, v);
  } else {
    return reduced("big");
  }
}, range(10));
45

reduce(function (a, v) {
  if (a < 100) {
    return plus(a, v);
  } else {
    return reduced("big");
  }
}, range(20));
"big"

*/
export function reduced(x) {
  return new Reduced(x);
}

/*
reducedQmark() returns true if x is the result of a call to reduced

reducedQmark("foo");
false

reducedQmark(reduced("foo"));
true

*/
export function reducedQmark(x) {
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
assocBang() adds a value to a structure by mutating the original

var arrData = [1, 2, 5, 6, 8, 9];
assocBang(someData, 0, 77);
[ 77, 2, 5, 6, 8, 9 ]

var objData = { name: "George", occupation: "Sofa tester" };
assocBang(objData, "foodPreference", "fish");
{ name: "George", occupation: "Sofa tester", foodPreference: "fish" }

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

assocBang({ name: "George", occupation: "Sofa tester" }, "foodPreference", "fish");
{ name: "George", occupation: "Sofa tester", foodPreference: "fish" }

*/
export function assoc(coll, key, val, ...kvs) {
  if (!coll) {
    coll = {};
  }

  switch (typeConst(coll)) {
    case MAP_TYPE:
      return assocBang(new Map(coll.entries()), key, val, ...kvs);
    case ARRAY_TYPE:
      return assocBang([...coll], key, val, ...kvs);
    case OBJECT_TYPE:
      return assocBang({ ...coll }, key, val, ...kvs);
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
assocInBang() associates a value in a nested structure by mutating value

var pets = [{name: "George", age: 12}, {name: "Lola", age: 11}];

assocInBang(pets, [0, "age"], 13);
pets
[
  { name: "George", age: 13 },
  { name: "Lola", age: 11 },
];

*/
export function assocInBang(coll, keys, val) {
  return assocInWith(assocBang, "assocIn!", coll, keys, val);
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
dissocBang removes item(s) from an object by key name

var dissocObj = {name: "George", salary: "Biscuits"};
dissocBang(dissocObj, "name", "salary");
{}
  
*/
export function dissocBang(obj, ...keys) {
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

comp(zeroQmark)(5);
false

comp(str, plus)(8, 8, 8);
"24"

comp(str);
[Function: str]

comp(null);
null

comp();
[Function: identity]

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
conjBang() (conjoin) adds to a structure by mutation. The position of the addition
depends on the structure type

conjBang([1, 2, 3], 4);
[ 1, 2, 3, 4 ]

conjBang({name: "George", coat: "Tabby"}, {age: 12, nationality: "British"})
{ name: 'George', coat: 'Tabby', age: 12, nationality: 'British' }

*/
export function conjBang(...xs) {
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
disjBang() removes item(s) from a set via mutation

var disjSet = new Set(["a", "b", "c"]);
disjBang(disjSet, "b");
Set(2) { 'a', 'c' }

*/
export function disjBang(set, ...xs) {
  for (const x of xs) {
    set.delete(x);
  }
  return set;
}

/*
disjBang() returns a new copy of a set with item(s) removed

disj(new Set(["a", "b", "c"]), "b");
Set(2) { 'a', 'c' }

*/
export function disj(set, ...xs) {
  let set1 = new Set([...set]);
  return disjBang(set1, ...xs);
}

/*
contains() returns true if key is present in the given collection,
otherwise false. For arrays the key is the index.

contains({name: "George", salary: "Biscuits"}, "name");
true

*/
export function contains(coll, val) {
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

[...interleave(["a", "b", "c"], [1, 2])];
[ 'a', 1, 'b', 2 ]

[...interleave(["a", "b"], [1, 2, 3])];
[ 'a', 1, 'b', 2 ]

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

apply(str, interpose(", ", ["one", "two", "three"]));
"one, two, three"

*/
export function interpose(sep, coll) {
  return drop(1, interleave(repeat(sep), coll));
}

/*
selectKeys() returns a map containing only those entries in the map
whose key is in keys

selectKeys({a: 1, b: 2}, ["a"]);
{ a: 1 }

selectKeys({a: 1, b: 2}, ["a", "c"]);
{ a: 1 }

selectKeys({a: 1, b: 2, c: 3}, ["a", "c"]);
{ a: 1, c: 3 }

*/
export function selectKeys(coll, keys) {
  const type = typeConst(coll);

  const ret = emptyOfType(type);

  for (const key of keys) {
    const val = get(coll, key);

    if (val !== undefined && val !== null) {
      assocBang(ret, key, val);
    }
  }

  return ret;
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
get() returns the value mapped to key, notFound or null if the key 
is not present

get([1, 2, 3], 1);
2

get([1, 2, 3], 5);
null

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

str();
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
nilQmark() returns true if x is null, false otherwise

nilQmark(null);
true

nilQmark(false);
false

nilQmark(true);
false

*/
export function nilQmark(x) {
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
  this._resetBang = (x) => (this.value = x);
}

/*
  Atoms provide a way to manage shared, synchronous, independent
  state

  var myAtom = atom(0);
  myAtom;
  Atom {
    value: 0,
    _deref: [Function (anonymous)],
    _resetBang: [Function (anonymous)]
  }

  myAtom.value;
  0

  swapBang(myAtom, inc);
  1

  swapBang(myAtom, function(n) { return (n + n) * 2 });
  4

  resetBang(myAtom, 0);

  myAtom.value;
  0

*/
export function atom(init) {
  return new Atom(init);
}

export function deref(ref) {
  return ref._deref();
}

export function resetBang(atom, val) {
  atom._resetBang(val);
}

export function swapBang(atom, f, ...args) {
  const val = f(deref(atom), ...args);
  resetBang(atom, val);

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

vector(null);
[ null ]

vector(1, 2, 3);
[ 1, 2, 3 ]

*/
export function vector(...args) {
  return args;
}

/*
vectorQmark() checks if x is an array

vectorQmark([1, 2, 3]);
true

vectorQmark("hello");
false

*/
export function vectorQmark(x) {
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
evenQmark() returns true if x is even

evenQmark(2);
true

evenQmark(null);
Error

*/
export function evenQmark(x) {
  if (typeof x !== "number") {
    throw new Error(`Illegal argument: ${x} is not a number`);
  }

  return x % 2 === 0;
}

/*
oddQmark() returns true if x is odd

oddQmark(3);
true

oddQmark(null);
Error

*/
export function oddQmark(x) {
  return not(evenQmark(x));
}

/*
complement() takes a fn f and returns a fn that takes the same arguments
as f, has the same effects, if any, and returns the opposite truth value

var testIsOdd = complement(evenQmark);
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
identicalQmark() tests if two arguments are the equal

identicalQmark(1, 1);
true

*/
export function identicalQmark(x, y) {
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
reverse() returns an array with items in reverse order

reverse([1, 2, 3]);
[ 3, 2, 1 ]


*/
export function reverse(x) {
  return x.reverse();
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
trueQmark() returns true if x is true, false otherwise


trueQmark(1 > 0);
true

*/
export function trueQmark(x) {
  return x === true;
}

/*
falseQmark() returns true if x is false, false otherwise

falseQmark(1 > 0);
false

*/
export function falseQmark(x) {
  return x === false;
}

/*
someQmark() returns true if x is not null or undefined, false otherwise

someQmark(1 < 5);
true

*/
export function someQmark(x) {
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
zeroQmark() returns true if x is zero, false otherwise

zeroQmark(3);
false

*/
export function zeroQmark(x) {
  return x === 0;
}

/*
negQmark() returns true if x is less than zero, false otherwise

negQmark(-5);
true

*/
export function negQmark(x) {
  return x < 0;
}

/*
posQmark() returns true if x is greater than zero, false otherwise

posQmark(5);
true

*/
function posQmark(x) {
  return x > 0;
}

/*
drop() returns a lazy sequence of all but the first n items in coll

[...drop(-1, [1, 2, 3, 4])];
[ 1, 2, 3, 4 ]

[...drop(2, [1, 2, 3, 4])];
[ 3, 4 ]

[...drop(5, [1, 2, 3, 4])];
[]

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

[...dropWhile(negQmark, [-1, -2, -6, -7, 1, 2, 3, 4, -5, -6, 0, 1])];
[ 1,  2, 3, 4, -5, -6, 0, 1 ]

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

var pet = {name: "George", age: 11};
update(pet, "age", inc);
{ name: 'George', age: 12 }

update([1, 2, 3], 0, inc);
[ 2, 2, 3 ]

update([], 0, function(item) { return str("foo", item); });
[ 'foo' ]

*/
export function update(coll, key, f, ...args) {
  return assoc(coll, key, f(get(coll, key), ...args));
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

getIn(pet, ["profile", "address", "city"]);
'London'

getIn(pet, ["profile", "address", "postcode"]);
null

getIn(pet, ["profile", "address", "postcode"], "no postcode");
'no postcode'

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


function charCount(s) {
  return reduce((m, k) => updateIn(m, [k], fnil(inc, 0)), {}, s);
}

charCount("foo-bar");
{ f: 1, o: 2, '-': 1, b: 1, a: 1, r: 1 }

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

*/

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
