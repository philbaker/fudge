/**
 * Core data types
 *
 * @private
 *
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

/**
 * Internal function which returns a new empty collection based on type
 *
 * @private
 * @func
 * @param {*}
 * @return {*}
 *
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
  return null;
}

/**
 * Internal function which returns data type based by checking the object
 *
 * @private
 * @func
 * @param {*}
 * @return {number}
 * @example
 *
 * typeConst([1, 2, 3]);
 * // => 2
 *
 * typeConst({name: "George", occupation: "Cat"});
 * // => 3
 *
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

  return null;
}

/**
 * Internal function which returns primitive type by checking x
 *
 * @private
 * @func
 * @param {*}
 * @return {number}
 * @example
 *
 * typePrimitive(false);
 * // => 7
 *
 * typePrimitive(1);
 * // => 8
 *
 */
function typePrimitive(x) {
  if (typeof x === "boolean") {
    return BOOLEAN_TYPE;
  }

  if (typeof x === "number") {
    return NUMBER_TYPE;
  }

  if (typeof x === "string") {
    return STRING_TYPE;
  }

  if (typeof x === "function") {
    return FUNCTION_TYPE;
  }

  return null;
}

/**
 * creates something similar to a Clojure's List structure using JavaScript arrays
 *
 * It's useful to have a seperate structure because the lists behave differently to
 * vectors in some functions
 *
 * Exported for tests, not intended for direct use
 *
 * @private
 * @class
 * @param {...*}
 * @return {List}
 * @example
 *
 * new List(1, 2, 3);
 * // => List(3) [1, 2, 3]
 *
 */
export class List extends Array {
  constructor(...args) {
    super();
    this.push(...args);
  }
}

/**
 * checks if x is a List
 *
 * @func
 * @param {*}
 * @return {boolean}
 *
 * isList(new List(1, 2, 3));
 * // => true
 *
 * isList("hello");
 * // => false
 *
 */
export function isList(x) {
  return typeConst(x) === LIST_TYPE;
}

/**
 * creates a new List containing args
 *
 * @func
 * @param {...*}
 * @return {List}
 * @example
 *
 * list("a", "b", "c");
 * // => List(3) ["a", "b", "c"]
 *
 * list(1, 2, 3);
 * // => List(3) [1, 2, 3]
 *
 */
export function list(...args) {
  return new List(...args);
}

/**
 * returns a lazy sequence of the concatenation of elements in colls
 *
 * @func
 * @param {...Array}
 * @return {LazyIterable}
 * @example
 *
 * [...concat([1, 2], [3, 4])];
 * // => [1, 2, 3, 4]
 *
 * [...concat(["a", "b"], null, [1, [2, 3], 4])];
 * // => ["a", "b", 1, [2, 3], 4]
 *
 */
export function concat(...colls) {
  return lazy(function* () {
    for (const coll of colls) {
      yield* iterable(coll);
    }
  });
}

/**
 * returns a LazyIterable of applying concat to the result of
 * applying map to f and colls
 *
 * @func
 * @param {function}
 * @param {...Array}
 * @return {LazyIterable}
 * @example
 *
 * [...mapcat(reverse, [[3, 2, 1, 0], [6, 5, 4], [9, 8, 7]])];
 * // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 *
 * [...mapcat(list, ["a", "b", "c"], [1, 2, 3])];
 * // => ["a", 1, "b", 2, "c", 3]
 *
 */
export function mapcat(f, ...colls) {
  return concat(...map(f, ...colls));
}

/**
 * returns true if the seq function is supported for x
 *
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {boolean}
 * @example
 *
 * isSeqable("hello");
 * // => true
 *
 */
export function isSeqable(x) {
  return (
    typeof x === "string" ||
    x === null ||
    x === undefined ||
    Symbol.iterator in x
  );
}

/**
 * Internal function whichereturns an iterable of x, even if it's empty
 * allowing for nil punning
 *
 * @private
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {Array|List|Map|Set|Object|List|string}
 * @example
 *
 * iterable(null);
 * // => []
 *
 * iterable("abc");
 * // => "abc"
 *
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

/**
 * Internal funtion used for creating lazy sequences
 *
 * @private
 * @func
 * @param {Array|Object}
 * @return {Object}
 * @example
 *
 * iterator([1, 2, 3]);
 * // => Object [Array Iterator] {}
 *
 */
function iterator(coll) {
  return coll[Symbol.iterator]();
}

/**
 * takes a collection and returns an iterable of that collection, or nil if
 * it's empty.
 *
 * @func
 * @param {*}
 * @return {Array|null}
 * @example
 *
 * seq([1, 2]);
 * // => [1, 2]
 *
 * seq(null);
 * // => null
 *
 */
export function seq(x) {
  var iter = iterable(x);

  if (iter.length === 0 || iter.size === 0) {
    return null;
  }

  return iter;
}

/**
 * Enables lazy evaluation of sequences
 *
 * @private
 *
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

/**
 * Internal function which returns a new instance of LazyIterable
 *
 * @private
 * @func
 * @params {function}
 * @return {LazyIterable}
 *
 */
function lazy(f) {
  return new LazyIterable(f);
}

/**
 * returns a new LazyIterable where x is the first item and
 * coll is the rest
 *
 * @func
 * @param {*}
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...cons(1, [2, 3, 4, 5, 6])];
 * // => [1, 2, 3, 4, 5, 6]
 *
 * [...cons([1, 2], [4, 5, 6])];
 * // => [[1, 2], 4, 5, 6]
 *
 */
export function cons(x, coll) {
  return lazy(function* () {
    yield x;
    yield* iterable(coll);
  });
}

/**
 * applies a given function to each element of a collection
 *
 * @func
 * @param {function}
 * @param {...Array|List|Map|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...map(inc, [1, 2, 3, 4, 5])];
 * // => [2, 3, 4, 5, 6]
 *
 * [...map(last, {x: 1, y: 2, z: 3})];
 * // => [1, 2, 3]
 *
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

/**
 * returns a lazy sequence of the items in coll for which
 * pred(item) returns true
 *
 * @func
 * @param {function} predicate
 * @param {Array|List|Set|null} collection
 * @example
 *
 * [...filter(isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
 * // => [0, 2, 4, 6, 8, 10]
 *
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

/**
 * returns an array of the items in coll for which
 * pred(item) returns true
 *
 * @param {function} predicate check
 * @param {Array|List|Set|null} collection
 * @return {Array}
 * @example
 *
 * filterv(isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
 * // => [0, 2, 4, 6, 8, 10]
 *
 */
export function filterv(pred, coll) {
  return [...filter(pred, coll)];
}

/**
 * returns a lazy sequence of the items in coll for which
 * pred(item) returns false
 *
 * @func
 * @param {function} predicate check
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {LazyIterable}
 *
 * [...remove(isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
 * // => [1, 3, 5, 7, 9]
 *
 */
export function remove(pred, coll) {
  return filter(complement(pred), coll);
}

/**
 * returns an array of the result of applying f to 0 and the first
 * item of coll, followed by applying f to 1 and the second item in the coll etc
 *
 * @func
 * @param {function}
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * mapIndexed((index, item) => [index, item], "foobar");
 * => [
 *      [0, "f"],
 *      [1, "o"],
 *      [2, "o"],
 *      [3, "b"],
 *      [4, "a"],
 *      [5, "r"],
 *    ];
 *
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

/**
 * returns a LazyIterable collection containing a possibly empty seq of the items
 * after the first
 *
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...rest([1, 2, 3])];
 * // => [2, 3]
 *
 * [...rest(null)];
 * // => []
 *
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

/**
 * returns the first item of collection
 *
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {*}
 * @example
 *
 * first([1, 2, 3]);
 * // => 1
 *
 * first("abc");
 * // => "a"
 *
 */
export function first(coll) {
  var [first] = iterable(coll);

  return first ?? null;
}

/**
 * returns the second item of a collection
 *
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {*}
 * @example
 *
 * second([1, 2, 3]);
 * // => 2
 *
 */
export function second(coll) {
  var [_, v] = iterable(coll);

  return v ?? null;
}

/**
 * the same as first(first(coll))
 *
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {*}
 * @example
 *
 * ffirst({name: "George", weight: 100})
 * // => "name"
 *
 */
export function ffirst(coll) {
  return first(first(coll));
}

/**
 * returns the last item in a collection
 *
 * @func
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {*}
 * @example
 *
 * last([1, 2, 3, 4, 5]);
 * // => 5
 *
 * last({one: 1, two: 2, three: 3});
 * // => ["three", 3]
 *
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

/**
 * Internal class for reduce()
 *
 * @private
 *
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

/**
 * wraps x so that reduce will terminate with the value x
 *
 * @func
 * @param {*}
 * @return {*}
 * @example
 *
 * reduce((a, b) => {
 *   if ((a + b) > 20) {
 *     return reduced("Done early!");
 *   } else {
 *     return a + b;
 *   }
 * }, range(10));
 * // => "Done early!"
 *
 */
export function reduced(x) {
  return new Reduced(x);
}

/**
 * returns true if x is the result of a call to reduced
 *
 * @func
 * @param {function}
 * @return {boolean}
 * @example
 *
 * isReduced("foo");
 * // => false
 *
 * isReduced(reduced("foo"));
 * // => true
 *
 */
export function isReduced(x) {
  return x instanceof Reduced;
}

/**
 * iterates over a collection and applies a function to each
 * element, returning a single result
 *
 * @func
 * @param {function}
 * @return {Array|List|Map|Set|Object|string}
 * @example
 *
 * reduce(plus, [1, 2, 3, 4, 5]);
 * // => 15
 *
 * reduce(plus, [1]);
 * // => 1
 *
 */
export function reduce(f, arg1, arg2) {
  let coll, val;

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

/**
 * returns a lazy sequence of the intermediate values of the reduction
 *
 * @func
 * @param {function}
 * @param {Array|List}
 * @param {Array|List}
 * @return {LazyIterable}
 * @example
 *
 * [...reductions(plus, [1, 2, 3, 4, 5])];
 * // => [1, 3, 6, 10, 15]
 *
 * [...reductions(conj, [], list(1, 2, 3))];
 * // => [[], [1], [1, 2], [1, 2, 3]]
 *
 */
export function reductions(f, init, coll) {
  if (coll === undefined) {
    coll = iterable(init);
    init = coll[0];
    coll = coll.slice(1);
  }

  return lazy(function* () {
    let acc = init === undefined ? 0 : init;

    yield acc;

    for (const item of coll) {
      acc = f(acc, item);
      yield acc;
    }
  });
}

/**
 * MUTATOR: adds a value to a structure by mutating the original
 *
 * @func
 * @param {Array|Map|Object}
 * @param {number|string}
 * @param {*} value
 * @return {Array}
 * @example
 *
 * var arrData = [1, 2, 5, 6, 8, 9];
 * mutAssoc(someData, 0, 77);
 * // => [77, 2, 5, 6, 8, 9]
 *
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

/**
 * returns a new structure with a modified values
 *
 * @func
 * @param {Array|Map|Object}
 * @param {number|string}
 * @param {*} value
 * @return {Array}
 * @example
 *
 * assoc([1, 2, 5, 6, 8, 9], 0, 77);
 * // => [77, 2, 5, 6, 8, 9]
 *
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

/**
 * Internal function
 * allows for modification (mutation or copy) of nested structures
 *
 * @private
 *
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

/**
 * MUTATOR: associates a value in a nested structure by mutating value
 *
 * @func
 * @param {Array|May|object}
 * @return {Array}
 * @example
 *
 * var pets = [
 *   { name: "George", age: 12 },
 *   { name: "Lola", age: 11 },
 * ];
 * mutAssocIn(pets, [0, "age"], 13);
 * pets
 * // => [
 * //      { name: "George", age: 13 },
 * //      { name: "Lola", age: 11 },
 * //    ];
 *
 */
export function mutAssocIn(coll, keys, val) {
  return assocInWith(mutAssoc, "assocIn!", coll, keys, val);
}

/**
 * assocIn() associates a value in a nested structure. It returns a new structure
 *
 * @func
 * @param {Array|May|object}
 * @return {Array}
 * @example
 *
 * assocIn([{name: "George", age: 12}, {name: "Lola", age: 11}], [0, "age"], 13);
 * // => [
 * //      { name: "George", age: 13 },
 * //      { name: "Lola", age: 11 },
 * //    ];
 *
 */
export function assocIn(coll, keys, val) {
  return assocInWith(assoc, "assocIn", coll, keys, val);
}

/**
 * MUTATOR: removes item(s) from an object by key name
 *
 * @func
 * @param {Object} object
 * @param {...string} keys
 * @return {Object}
 * @example
 *
 * var dissocObj = {name: "George", salary: "Biscuits"};
 * mutDissoc(dissocObj, "name", "salary");
 * // => {}
 * dissocObj
 * // => {}
 *
 */
export function mutDissoc(obj, ...keys) {
  for (const key of keys) {
    delete obj[key];
  }

  return obj;
}

/**
 * returns a copy of an object with item(s) removed by key name
 *
 * @func
 * @param {Object} object
 * @param {...string} keys
 * @return {Object}
 * @example
 *
 * dissoc({name: "George", salary: "Biscuits"}, "name", "salary");
 * // => {}
 *
 */
export function dissoc(obj, ...keys) {
  let obj2 = { ...obj };

  for (const key of keys) {
    delete obj2[key];
  }

  return obj2;
}

/**
 * takes a set of functions and returns a fn that is the composition
 * of those fns
 *
 * @func
 * @param {...function}
 * @return {*}
 * @example
 *
 * comp(isZero)(5);
 * // => false
 *
 * comp(str, plus)(8, 8, 8);
 * // => "24"
 *
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

/**
 * MUTATOR: mutConj(oin) adds to a structure by mutation. The position of the addition
 * depends on the structure type
 *
 * @func
 * @param {Set|Array|List|Map|Object}
 * @param {*}
 * @return {Set|Array|List|Map|Object}
 * @example
 *
 * mutConj([1, 2, 3], 4);
 * // => [1, 2, 3, 4]
 *
 * mutConj({name: "George", coat: "Tabby"}, {age: 12, nationality: "British"})
 * // => {name: "George", coat: "Tabby", age: 12, nationality: "British"}
 *
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

/**
 * conj() (conjoin) adds to a structure and returns a copy. The position of the
 * addition depends on the structure type
 *
 * @func
 * @param {Set|Array|List|Map|Object}
 * @param {*}
 * @return {Set|Array|List|Map|Object}
 * @example
 *
 * conj([1, 2, 3], 4);
 * // => [1, 2, 3, 4]
 *
 * conj([1, 2, 3], 4, 5);
 * // => [1, 2, 3, 4, 5]
 *
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

/**
 * MUTATOR: removes item(s) from a set via mutation
 *
 * @func
 * @param {Set}
 * @return {Set}
 * @example
 *
 * var disjSet = new Set(["a", "b", "c"]);
 * mutDisj(disjSet, "b");
 * // => Set(2) { "a", "c" }
 *
 */
export function mutDisj(set, ...xs) {
  for (const x of xs) {
    set.delete(x);
  }
  return set;
}

/**
 * returns a new copy of a set with item(s) removed
 *
 * @func
 * @param {Set}
 * @return {Set}
 * @example
 *
 * disj(new Set(["a", "b", "c"]), "b");
 * // => Set(2) { "a", "c" }
 *
 */
export function disj(set, ...xs) {
  let set1 = new Set([...set]);
  return mutDisj(set1, ...xs);
}

/**
 * returns true if key is present in the given collection,
 * otherwise false. For arrays the key is the index.
 *
 * @func
 * @param {Array|Map|Set|List|Object}
 * @return {boolean}
 * @example
 *
 * itContains({name: "George", salary: "Biscuits"}, "name");
 * // => true
 *
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

/**
 * returns the sum of numbers
 *
 * @func
 * @param {...number}
 * @return {number}
 * @example
 *
 * plus(1, 2, 3);
 * // => 6
 *
 */
export function plus(...xs) {
  return xs.reduce((x, y) => x + y, 0);
}

/**
 * returns the subtraction of numbers
 *
 * @func
 * @param {...number}
 * @return {number}
 * @example
 *
 * minus(5, 1, 2);
 * // => 2
 *
 */
export function minus(...xs) {
  return xs.reduce((x, y) => x - y);
}

/**
 * returns the division of numbers
 *
 * @func
 * @param {...number}
 * @return {number}
 * @example
 *
 * divide(6, 3);
 * // => 2
 *
 * divide(10);
 * // => 0.1
 *
 * divide(6, 3, 2);
 * // => 1
 *
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

/**
 * returns the quotient of dividing numerator by denominator
 *
 * @func
 * @param {number}
 * @return {number
 * @example
 *
 * quot(10, 3);
 * // => 3
 *
 * quot(11, 3);
 * // => 3
 *
 * quot(12, 3);
 * // => 4
 *
 */
export function quot(a, b) {
  return Math.floor(a / b);
}

/**
 * returns the product of numbers
 *
 * @func
 * @param {number}
 * @return {number}
 * @example
 *
 * multiply();
 * // => 1
 *
 * multiply(6);
 * // => 6
 *
 * multiply(2, 3);
 * // => 6
 *
 * multiply(2, 3, 4);
 * // => 24
 *
 */
export function multiply(...xs) {
  return xs.reduce((x, y) => x * y, 1);
}

/**
 * greater than (>) returns true if numbers are in decreasing order, otherwise false
 *
 * @func
 * @param {...number}
 * @return {boolean}
 * @example
 *
 * gt(1, 2);
 * // => false
 *
 * gt(2, 1);
 * // => true
 *
 * gt(6, 5, 4, 3, 2)
 * // => true
 *
 */
export function gt(...xs) {
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i] <= xs[i + 1]) {
      return false;
    }
  }
  return true;
}

/**
 * less than (<) returns true if numbers are in decreasing order, otherwise false
 *
 * @func
 * @param {number}
 * @return {boolean}
 * @example
 *
 * lt(1, 2);
 * // => true
 *
 * lt(2, 1);
 * // => false
 *
 * lt(2, 3, 4, 5, 6);
 * // => true
 *
 */
export function lt(...xs) {
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i] >= xs[i + 1]) {
      return false;
    }
  }

  return true;
}

/**
 * returns its argument
 *
 * @func
 * @param {*}
 * @return {*}
 * @example
 *
 * identity([1]);
 * // => [1]
 *
 */
export function identity(x) {
  return x;
}

/**
 * returns a lazy sequence of the first item in each coll,
 * then the second etc
 *
 * @func
 * @param {Array|Map|Set|List|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...interleave(["a", "b", "c"], [1, 2, 3])];
 * // => ["a", 1, "b", 2, "c", 3]
 *
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
 * interpose() returns a lazy sequence of the elements of coll separated
 * by sep
 *
 * @func
 * @param {Array|Map|Set|List|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...interpose(", ", ["one", "two", "three"])];
 * // => ["one", ", ", "two", ", ", "three"]
 *
 */
export function interpose(sep, coll) {
  return drop(1, interleave(repeat(sep), coll));
}

/**
 * returns a map containing only those entries in the map whose key is in keys
 *
 * @func
 * @param {Array|Map|Set|Object|List|string|null}
 * @param {Array}
 * @return {Object}
 * @example
 *
 * selectKeys({a: 1, b: 2}, ["a"]);
 * // => {a: 1}
 *
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

/**
 * Internal function
 * _partition() is a helper function for partition and partitionAll
 *
 * @private
 *
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

/**
 * returns a lazy sequence of n items each at offsets step apart
 *
 * @func
 * @param {number}
 * @param {Array|Map|Set|Object|List|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...partition(4, range(20))];
 * // => [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [16, 17, 18, 19]]
 *
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

/**
 * returns a lazy sequence of arrays like partition but
 * may include partitions with fewer than n items at the end
 *
 * @func
 * @param {number}
 * @param {Array|List|Map|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * [...partitionAll(4, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
 * // => [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]]
 *
 */
export function partitionAll(n, ...args) {
  let step = n;
  let coll = args[0];

  if (args.length === 2) {
    [step, coll] = args;
  }

  return _partition(n, step, [], coll, true);
}

/**
 * returns an empty coll of the same category as coll or null
 *
 * @func
 * @param {Array|Map|Set|List|Object|null}
 * @return {Array|Map|Set|List|Object|null}
 * @example
 *
 * empty(list(1, 2));
 * // => List(0) []
 *
 */
export function empty(coll) {
  const type = typeConst(coll);

  return emptyOfType(type);
}

/**
 * returns an object that consists of the rest of the maps conjed onto the first
 *
 * @func
 * @param {...Array|Map|Set|List|Object|string|null}
 * @return {Array|Map|Set|List|Object}
 * @example
 *
 * merge({a: 1, b: 2, c: 3}, {b: 9, d: 4});
 * // => { a: 1, b: 9, c: 3, d: 4 }
 *
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

/**
 * returns a new coll containing values from colls conjoined
 *
 * @func
 * @param {...Array|Map|Set|Object|string|null}
 * @return {Array|Map|Set|Object}
 * @example
 *
 * into([], [1, 2, 3]);
 * // => [1, 2, 3]
 *
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

/**
 * returns a number one greater than n
 *
 * @func
 * @param {number}
 * @return {number}
 * @example
 *
 * inc(5);
 * // => 6
 *
 */
export function inc(n) {
  return n + 1;
}

/**
 * returns a number one less than n
 *
 * @func
 * @param {number}
 * @return {number}
 * @example
 *
 * dec(5);
 * // => 4
 *
 */
export function dec(n) {
  return n - 1;
}

/**
 * a wrapper for console.log()
 *
 * @func
 * @param {*}
 * @return {undefined}
 * @example
 *
 * println("Hello", "world");
 * (out) Hello world
 * // => undefined
 *
 */
export function println(...args) {
  console.log(...args);
}

/**
 * returns the value at the index
 *
 * @func
 * @param {Array|List|string}
 * @return {*}
 * @example
 *
 * nth(["a", "b", "c", "d"], 0);
 * // => "a"
 *
 */
export function nth(coll, index, notFound = null) {
  let i = 0;

  for (let element of coll) {
    if (i === index) {
      return element;
    }
    i++;
  }

  return notFound;
}

/**
 * returns the value mapped to key, notFound or null if the key is not present
 *
 * @func
 * @param {Array|List|Map|Set|Object|string}
 * @key {number|string}
 * @return {*}
 * @example
 *
 * get([1, 2, 3], 1);
 * // => 2
 *
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

/**
 * returns a string for single values and a concatenation of multiple values
 *
 * @func
 * @param {...*}
 * @return {string}
 * @example
 *
 * str(1);
 * // => "1"
 *
 * str(1, 2, 3);
 * // => "123"
 *
 */
export function str(...xs) {
  return xs.join("");
}

/**
 * returns true if x is logical false, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * not(true);
 * // => false
 *
 */
export function not(x) {
  return !x;
}

/*
 * returns true if x is null, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isNil(null);
 * // => true
 *
 */
export function isNil(x) {
  return x === null;
}

/**
 * Internal function for prStr
 *
 * @private
 *
 */
function _prStr(x) {
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

/**
 * turns a collection into a string and returns it
 *
 * @func
 * @param {...*}
 * @return {string}
 * @example
 *
 * prStr([1, 2, 3, 4, 5]);
 * // => "[1,2,3,4,5]"
 *
 * prStr({name: "George", salary: "Biscuits"});
 * // => "{"name":"George","salary":"Biscuits"}"
 *
 */
export function prStr(...xs) {
  return xs.map(_prStr).join("");
}

/**
 * turns a collection into a string and prints to console
 * returns undefined
 *
 * @func
 * @param {...*}
 * @return {undefined}
 * @example
 *
 * prn([1, 2, 3, 4, 5]);
 * (out) "[1,2,3,4,5]"
 * // => undefined
 *
 * prn({name: "George", salary: "Biscuits"});
 * (out) "{"name":"George","salary":"Biscuits"}"
 * // => undefined
 *
 */
export function prn(...xs) {
  println(prStr(...xs));
}

/**
 * Internal function for Atoms
 *
 * @private
 *
 */
function Atom(init) {
  this.value = init;
  this._deref = () => this.value;
  this._mutReset = (x) => (this.value = x);
}

/**
 * Atoms provide a way to manage state
 *
 * @func
 * @param {*} value
 * @return {Atom}
 * @example
 *
 * var myAtom = atom(0);
 * myAtom;
 * // => Atom {
 * //      value: 0,
 * //      _deref: [Function (anonymous)],
 * //      _mutReset: [Function (anonymous)]
 * //   }
 *
 * deref(myAtom);
 * // => 0
 *
 * mutSwap(myAtom, inc);
 * // => 1
 *
 * mutSwap(myAtom, function(n) { return (n + n) * 2 });
 * // => 4
 *
 * mutReset(myAtom, 0);
 *
 * deref(myAtom);
 * // => 0
 *
 */
export function atom(init) {
  return new Atom(init);
}

/**
 * returns the value stored in an atom
 *
 * @func
 * @param {Atom}
 * @return {*}
 * @example
 *
 * var myAtom = atom(0);
 * mutSwap(myAtom, inc);
 * deref(myAtom);
 * // => 1
 *
 */
export function deref(ref) {
  return ref._deref();
}

/**
 * MUTATOR: resets the value stored in an atom
 *
 * @func
 * @param {Array|Map|Set|Object|string|null}
 * @return {*}
 * @example
 *
 * var myAtom = atom(0);
 * mutSwap(myAtom, inc);
 * deref(myAtom);
 * // => 1
 *
 * mutReset(myAtom, 0);
 * deref(myAtom);
 * // => 0
 *
 */
export function mutReset(atom, val) {
  atom._mutReset(val);
}

/**
 * MUTATOR: automatically changes the value of an existing atom by applying f
 * and returns the new value
 *
 * @func
 * @param {Atom}
 * @param {function}
 * @param {...*}
 * @return {*}
 * @example
 *
 * var myAtom = atom(0);
 * mutSwap(myAtom, inc);
 * // => 1
 *
 */
export function mutSwap(atom, f, ...args) {
  const val = f(deref(atom), ...args);
  mutReset(atom, val);

  return val;
}

/**
 * returns a lazy sequence of numbers from start to end
 *
 * @func
 * @param {number}
 * @param {number}
 * @param {number}
 * @return {LazyIterable}
 * @example
 *
 * [...range(10)];
 * // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 *
 * [...range(-5, 5)];
 * // => [-5, -4, -3, -2, -1, 0,  1,  2,  3,  4]
 *
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
 * returns the match, if any, of string to pattern using RegExp.prototype.exec()
 *
 * @func
 * @param {RegExp}
 * @param {string}
 * @return {Array|string}
 * @example
 *
 * reMatches(/hello, world/gi, "hello, world");
 * // => "hello, world"
 *
 * reMatches(/quick\s(?<color>brown).+?(jumps)/dgi, "The Quick Brown Fox Jumps Over The Lazy Dog");
 * // => ["Quick Brown Fox Jumps", "Brown", "Jumps"]
 *
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

/**
 * returns an array of the items in an array from start to end
 *
 * @func
 * @param {Array} array
 * @param {number} start
 * @param {number} end
 * @return {Array}
 * @example
 *
 * subvec([1, 2, 3, 4, 5, 6, 7], 2);
 * // => [3, 4, 5, 6, 7]
 *
 * subvec([1, 2, 3, 4, 5, 6, 7], 2, 4);
 * // => [3, 4]
 *
 */
export function subvec(arr, start, end) {
  return arr.slice(start, end);
}

/**
 * returns a new array containing args
 *
 * @func
 * @param {...*}
 * @return {Array}
 * @example
 *
 * vector();
 * // => []
 *
 * vector(1, 2, 3);
 * // => [1, 2, 3]
 *
 */
export function vector(...args) {
  return args;
}

/**
 * checks if x is an array
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isVector([1, 2, 3]);
 * // => true
 *
 * isVector("hello");
 * // => false
 *
 */
export function isVector(x) {
  return typeConst(x) === ARRAY_TYPE;
}

/**
 * returns the results of map() in an array rather than a lazy sequence
 *
 * @func
 * @param {function}
 * @param {...Array|List|Map|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * mapv(inc, [1, 2, 3, 4, 5]);
 * // => [2, 3, 4, 5, 6]
 *
 */
export function mapv(...args) {
  return [...map(...args)];
}

/**
 * creates a new array containing iterable of coll
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * vec(null);
 * []
 *
 * vec({a: 1, b: 2, c: 3});
 * [["a", 1], ["b", 2], ["c", 3]]
 *
 */
export function vec(coll) {
  return [...iterable(coll)];
}

/**
 * returns a set of the distinct elements of coll
 *
 * @func
 * @param {Array|Map|List|Object|string|null}
 * @return {*}
 * @example
 *
 * set([1, 2, 3, 4, 5]);
 * // => Set(5) { 1, 2, 3, 4, 5 }
 *
 * set("abcd")
 * // => Set(4) { 'a', 'b', 'c', 'd' }
 *
 */
export function set(coll) {
  return new Set(iterable(coll));
}

/**
 * applies f to the argument list formed by prepending intervening
 * arguments to args
 *
 * @func
 * @param {function}
 * @param {...*}
 * @return {string}
 * @example
 *
 * apply(str, ["str1", "str2", "str3"]);
 * // => "str1str2str3"
 *
 */
apply(str, [1, 2]);
export function apply(f, ...args) {
  var xs = args.slice(0, args.length - 1);
  var coll = args[args.length - 1];

  return f(...xs, ...coll);
}

/**
 * isEven() returns true if x is even
 *
 * @func
 * @param {number}
 * @return {boolean}
 * @example
 *
 * isEven(2);
 * // => true
 *
 * isEven(null);
 * throws error
 *
 */
export function isEven(x) {
  if (typeof x !== "number") {
    throw new Error(`Illegal argument: ${x} is not a number`);
  }

  return x % 2 === 0;
}

/**
 * returns true if x is odd
 *
 * @func
 * @param {number}
 * @return {boolean}
 * @example
 *
 * isOdd(3);
 * // => true
 *
 * isOdd(null);
 * throws error
 *
 */
export function isOdd(x) {
  return not(isEven(x));
}

/**
 * takes a fn f and returns a fn that takes the same arguments
 * as f, has the same effects, if any, and returns the opposite truth value
 *
 * @func
 * @param {function}
 * @return {function}
 * @example
 *
 * var testIsOdd = complement(isEven);
 * testIsOdd(3);
 * // => true
 *
 */
export function complement(f) {
  return (...args) => not(f(...args));
}

/**
 * constantly returns a function that takes any number of arguments and returns x
 *
 * @func
 * @param {*}
 * @return {function}
 * @example
 *
 * var boring = constantly(10);
 * boring()
 * // => 10
 *
 * boring("hello");
 * // => 10
 *
 */
export function constantly(x) {
  return (..._) => x;
}

/**
 * returns a lazy sequence of args
 *
 * @func
 * @param {...*}
 * @return {LazyIterable}
 * @example
 *
 * [...repeat(5, "x")];
 * // => ["x", "x", "x", "x", "x"]
 *
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

/**
 * returns a lazy sequence of the first n items in coll, or
 * all items if there are fewer than n
 *
 * @func
 * @param {number}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...take(3, [1, 2, 3, 4, 5, 6])];
 * // => [1, 2, 3]
 *
 * [...take(3, [1, 2])];
 * // => [1, 2]
 *
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

/**
 * returns a lazy sequence of successive items from coll
 * while pred(item) returns true
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...takeWhile(isNeg, [-2, -1, 0, 1, 2, 3])];
 * // => [-2, -1]
 *
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

/**
 * returns a lazy sequence of every nth item in coll
 *
 * @func
 * @param {number}
 * @param {Array|Map|List|Set|Object|string}
 * @return {LazyIterable}
 * @example
 *
 * [...takeNth(2, range(10))];
 * // => [0, 2, 4, 6, 8]
 *
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

/**
 * takes a function f and fewer than normal arguments to f. It returns a
 * fn that takes a variable number of additional args. When called, the
 * returned function calls f with args plus additional args
 *
 * @func
 * @param {function}
 * @param {...*}
 * @return {function}
 * @example
 *
 * var hundredPlus = partial(plus, 100);
 * hundredPlus(5);
 * // => 105
 *
 */
export function partial(f, ...xs) {
  return function (...args) {
    return f(...xs, ...args);
  };
}

/**
 * returns a lazy sequence of repetitions from items in coll
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...take(5, cycle(["a", "b"]))];
 * // => ["a", "b", "a", "b", "a"]
 *
 * [...take(10, cycle(range(0, 3)))];
 * // => [0, 1, 2, 0, 1, 2, 0, 1, 2, 0]
 *
 */
export function cycle(coll) {
  return lazy(function* () {
    while (true) {
      yield* coll;
    }
  });
}

/**
 * returns an array with items in reverse order
 *
 * @func
 * @param {Array|Map|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * reverse([1, 2, 3]);
 * // => [3, 2, 1]
 *
 * reverse("hello");
 * // => ["o", "l", "l", "e", "h"]
 *
 */
export function reverse(coll) {
  if (coll instanceof Array) {
    return coll.reverse();
  } else {
    return [...coll].reverse();
  }
}

/**
 * returns a sorted sequence of the items in coll
 *
 * @func
 * @param {function}
 * @param {Array|List|Set|string}
 * @return {Array}
 * @example
 *
 * sort([3, 4, 1, 2]);
 * // => [1, 2, 3, 4]
 *
 * sort((a, b) => b - a, [3, 4, 1, 2]);
 * // => [4, 3, 2, 1]
 *
 */
export function sort(f, coll) {
  if (coll === undefined) {
    coll = f;
    f = undefined;
  }
  return [...coll].sort(f);
}

/**
 * returns a random permutation of coll
 *
 * @func
 * @param {Array|List|Set|string}
 * @return {Array}
 * @example
 *
 * shuffle([1, 2, 3, 4]);
 * // => [2, 1, 3, 4]
 *
 */
export function shuffle(coll) {
  return [...coll].sort(function () {
    return Math.random() - 0.5;
  });
}

/**
 * returns the first true value of pred(x) for any x in coll,
 * otherwise null
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {*}
 * @example
 *
 * some(isEven, [1, 2, 3, 4]);
 * // => true
 *
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

/**
 * randInt() returns a random integer between 0 and n
 *
 * @func
 * @param {number}
 * @return {number}
 * @example
 *
 * randInt(30);
 * // => 27
 *
 * randInt(30);
 * // => 3
 *
 */
export function randInt(n) {
  return Math.floor(Math.random() * n);
}

/**
 * returns true if x is true, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isTrue(1 > 0);
 * // => true
 *
 */
export function isTrue(x) {
  return x === true;
}

/**
 * returns true if x is false, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isFalse(1 > 0);
 * // => false
 *
 */
export function isFalse(x) {
  return x === false;
}

/**
 * returns true if x is not null or undefined, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isSome(1 < 5);
 * // => true
 *
 */
export function isSome(x) {
  return not(x === null || x === undefined);
}

/**
 * returns x coerced to a boolean
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * booleans("hello");
 * // => true
 *
 * booleans(0)
 * // => false
 *
 */
export function booleans(x) {
  return !!x;
}

/**
 * returns true if x is zero, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isZero(3);
 * // => false
 *
 */
export function isZero(x) {
  return x === 0;
}

/**
 * returns true if x is less than zero, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isNeg(-5);
 * // => true
 *
 */
export function isNeg(x) {
  return x < 0;
}

/**
 * returns true if x is greater than zero, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 * isPos(5);
 *
 * // => true
 *
 */
export function isPos(x) {
  return x > 0;
}

/**
 * returns a lazy sequence of all but the first n items in coll
 *
 * @func
 * @param {number}
 * @param {...Array|List|Set|Object|string|null}
 * @return {LazySequence}
 * @example
 *
 * [...drop(-1, [1, 2, 3, 4])];
 * // => [1, 2, 3, 4]
 *
 * [...drop(2, [1, 2, 3, 4])];
 * // => [3, 4]
 *
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

/**
 * returns a lazy sequence of the items in coll starting from
 * the first item for which pred(value) returns false
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * [...dropWhile((x) => 3 > x, [1, 2, 3, 4, 5, 6])];
 * // => [3, 4, 5, 6]
 *
 * [...dropWhile((x) => 3 >= x, [1, 2, 3, 4, 5, 6])];
 * // => [4, 5, 6]
 *
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

/**
 * returns a lazy sequnce of the elements of coll with duplicates removed
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...distinct([1, 2, 1, 3, 1, 4, 1, 5])];
 * // => [1, 2, 3, 4, 5]
 *
 * [...distinct(["a", "a", "b", "c"])];
 * // => ["a", "b", "c"]
 *
 * apply(str, distinct("tattoo"));
 * // => "tao"
 *
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

/**
 * returns true if no two of the arguments are equal, false otherwise
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isDistinct(1, 2, 3);
 * // => true
 *
 * isDistinct(1, 2, 3, 3);
 * // => false
 *
 * isDistinct(["A", "A", "c"]);
 * // => true
 *
 */
export function isDistinct(...xs) {
  return xs.every((el, i) => {
    return xs.indexOf(el) === i;
  });
}

/**
 * returns a new structure with a value updated by f
 *
 * @func
 * @param {Array|Map|Object}
 * @param {*}
 * @param {function}
 * @param {...*}
 * @return {Array|Map|Object}
 * @example
 *
 * update([1, 2, 3], 0, inc);
 * // => [2, 2, 3]
 *
 * update([], 0, function(item) { return str("foo", item); });
 * // => ["foo"]
 *
 */
export function update(coll, key, f, ...args) {
  return assoc(coll, key, f(get(coll, key), ...args));
}

/**
 * MUTATOR: updates a collection with a value updated by f
 *
 * @func
 * @param {Array|Map|Object}
 * @return {Array|Map|Object}
 * @example
 *
 * var pet = {name: "George", age: 11};
 * mutUpdate(pet, "age", inc);
 * pet
 * // => {name: 'George', age: 12}
 *
 */
export function mutUpdate(coll, key, f, ...args) {
  const val = get(coll, key);

  return mutAssoc(coll, key, f(val, ...args));
}

/**
 * returns an object of the elements of coll keyed by the
 * result of f on each element
 *
 * @func
 * @param {function}
 * @param {Array|List|Set|null}
 * @return {Object}
 * @example
 *
 * groupBy(isOdd, range(10));
 * // => {false: [0, 2, 4, 6, 8], true: [1, 3, 5, 7, 9]}
 *
 */
export function groupBy(f, coll) {
  const res = {};

  for (const x of iterable(coll)) {
    const key = f(x);
    mutUpdate(res, key, fnil(mutConj, []), x);
  }

  return res;
}

/**
 * returns an object from distinct items in coll
 * to the number of times they appear
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Object}
 * @example
 *
 * frequencies(["a", "b", "a", "a"]);
 * // => {a: 3, b: 1}
 *
 */
export function frequencies(coll) {
  const res = {};
  const uf = fnil(inc, 0);

  for (const o of iterable(coll)) {
    mutUpdate(res, o, uf);
  }

  return res;
}

/**
 * returns a sequence of all but the last item in coll
 *
 * butlast([1, 2, 3]);
 * // => [1, 2]
 *
 */
export function butlast(coll) {
  let x = [...iterable(coll)];
  x.pop();

  return x.length > 0 ? x : null;
}

/**
 * returns a lazy sequence of all but the last n items in coll
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...dropLast([1, 2, 3, 4])];
 * // => [1, 2, 3]
 *
 */
export function dropLast(...args) {
  let [n, coll] = args.length > 1 ? args : [1, args[0]];

  return map((x, _) => x, coll, drop(n, coll));
}

/**
 * returns an array of [take(n, coll), drop(n, coll)]
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * splitAt(2, [1, 2, 3, 4, 5]);
 * // => [[1, 2], [3, 4, 5]]
 *
 */
export function splitAt(n, coll) {
  return [[...take(n, coll)], [...drop(n, coll)]];
}

/**
 * returns an array of [takeWhile(pred, coll), dropWhile(pred, coll)]
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Array}
 * @example
 *
 * splitWith(isOdd, [1, 3, 5, 6, 7, 9]);
 * // => [[1, 3, 5], [6, 7, 9]]
 *
 */
export function splitWith(pred, coll) {
  return [[...takeWhile(pred, coll)], [...dropWhile(pred, coll)]];
}

/**
 * returns the number of items in the collection
 *
 * @func
 * @param {*}
 * @return {number}
 * @example
 *
 * count([1, 2, 3]);
 * // => 3
 *
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

/**
 * returns a selected value from a nested structure
 *
 * @func
 * @param {Array|Map|List|Set|Object}
 * @param {Array}
 * @param {*}
 * @return {*}
 * @example
 *
 * var pet = {
 *   name: "George",
 *   profile: {
 *     name: "George V",
 *     address: { city: "London", street: "Tabby Lane" },
 *   },
 * }
 *
 * getIn(pet, ["profile", "name"]);
 * // => "George V"
 *
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

/**
 * updates a value in a nested structure
 *
 * @func
 * @param {Array|Map|List|Set|Object}
 * @param {Array}
 * @param {function}
 * @param {...*}
 * @return {Array|Map|List|Set|Object}
 *
 * @example
 * var pets = [{name: "George", age: 11}, {name: "Lola", age: 10}];
 * updateIn(pets, [1, "age"], inc);
 * // => [{name: "George", age: 11}, {name: "Lola", age: 11}]
 *
 */
export function updateIn(coll, path, f, ...args) {
  return assocIn(coll, path, f(getIn(coll, path), ...args));
}

/**
 * takes a function f, and returns a function that calls f, replacing
 * a null first argument to f with the supplied value x
 *
 * @func
 * @param {function}
 * @param {*}
 * @return {function}
 * @example
 *
 * function sayHello(name) {
 *   return str("Hello ", name);
 * }
 *
 * var sayHelloWithDefaults = fnil(sayHello, "world");
 *
 * sayHelloWithDefaults(null);
 * // => "Hello world"
 *
 * sayHelloWithDefaults("universe");
 * // => "Hello universe"
 *
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

/**
 * returns true if pred(x) is true for every x in coll,
 * otherwise false
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {boolean}
 * @example
 *
 * isEvery(isEven, [2, 4, 6]);
 * // => true
 *
 * isEvery(isEven, [1, 2, 3]);
 * // => false
 *
 */
export function isEvery(pred, coll) {
  for (let x of iterable(coll)) {
    if (!pred(x)) {
      return false;
    }
  }

  return true;
}

/**
 * returns false if pred(x) is true for every x in coll,
 * otherwise true
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {boolean}
 * @example
 *
 * isNotEvery(isEven, [2, 4, 6]);
 * // => false
 *
 * isNotEvery(isEven, [1, 2, 3]);
 * // => true
 *
 */
export function isNotEvery(pred, coll) {
  return !isEvery(pred, coll);
}

/**
 * returns false if pred(x) is true for any x in coll, otherwise true
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {boolean}
 * @example
 *
 * isNotAny(isOdd, [2, 4, 6]);
 * // => true
 *
 */
export function isNotAny(pred, coll) {
  return !some(pred, coll);
}

/**
 * Internal function
 * _repeatedly() is a helper for repeatedly()
 *
 * @private
 *
 */
function _repeatedly(f) {
  return lazy(function* () {
    while (true) {
      yield f();
    }
  });
}

/**
 * takes a function of no args and returns it with n calls to it
 *
 * @func
 * @param {number}
 * @return {function}
 * @return {LazyIterable}
 * @example
 *
 * [...repeatedly(5, () => randInt(11))];
 * // => [7, 7, 7, 6, 4]
 *
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

/**
 * returns a lazy sequence of the non-nil results of f(item)
 *
 * @func
 * @param {function}
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {LazyIterable}
 * @example
 *
 * [...keep(isEven, range(1, 10))];
 * // => [false, true, false, true, false, true, false, true, false]
 *
 */
export function keep(pred, coll) {
  return lazy(function* () {
    for (const x of iterable(coll)) {
      const res = pred(x);

      if (res !== null && res !== undefined) {
        yield res;
      }
    }
  });
}

/**
 * turns collection with any elements equal to a key in coll1 replaced with the
 * corresponding val in coll1
 *
 * @func
 * @param {*}
 * @param {*}
 * @return {*}
 * @example
 *
 * replace(["zeroth", "first", "second", "third", "fourth"], [0, 2, 4, 0])
 * // => ["zeroth", "second", "fourth", "zeroth"]
 *
 */
export function replace(coll1, coll2) {
  let mapf = coll2 instanceof Array ? mapv : map;

  return mapf((x) => {
    const repl = coll1[x];

    if (repl !== undefined) {
      return repl;
    } else {
      return x;
    }
  }, coll2);
}

/**
 * returns true if coll has no items
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {boolean}
 * @example
 *
 * isEmpty(list());
 * // => true
 *
 */
export function isEmpty(coll) {
  return seq(coll) ? false : true;
}

/**
 * evaluates test. If false evaluates and returns then or
 * otherwise (if supplied)
 *
 * @func
 * @param {*}
 * @param {*}
 * @param {*}
 * @return {*}
 * @example
 *
 * ifNot(isEmpty([1, 2]), first([1, 2]));
 * // => 1
 *
 * ifNot(isEmpty([]), first([1, 2]));
 * // => null
 *
 */
export function ifNot(test, then, otherwise = null) {
  if (!test) {
    return then;
  }

  return otherwise;
}

/**
 * checks if x is an instance of c
 *
 * @func
 * @param {Class}
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isInstance(String, "hello");
 * // => true
 *
 * isInstance(Number, 5);
 * // => true
 *
 * isInstance(Number, "5");
 * // => false
 *
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

/**
 * keys() returns all keys from a collection
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Array|null}
 * @example
 *
 * keys({a: 1, b: 2, c: 3});
 * // => ["a", "b", "c"]
 *
 * keys({});
 * // => null
 *
 * keys(null);
 * // => null
 *
 */
export function keys(x) {
  if (isEmpty(x)) {
    return null;
  }

  return Object.keys(x);
}

/**
 * returns all values from an object
 *
 * @func
 * @param {Array|Map|List|Set|Object|string|null}
 * @return {Array|null}
 * @example
 *
 * vals({a: 1, b: 2, c: 3});
 * // => [1, 2, 3]
 *
 * vals({});
 * // => null
 *
 * vals(null);
 * // => null
 *
 */
export function vals(x) {
  if (isEmpty(x)) {
    return null;
  }

  return Object.values(x);
}

/**
 * thread first threads x through the fns. Inserts x as the second item in the first
 * function. It will do the same for following functions.
 *
 * @func
 * @param {*}
 * @param {...function}
 * @return {*}
 * @example
 *
 * tf("3", parseInt);
 * // => 3
 *
 */
export function tf(x, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), x);
}

/**
 * thread last threads x through the fns. Inserts x as the last item in the first
 * function. It will do the same for following functions
 *
 * @func
 * @param {*}
 * @param {...function}
 * @return {*}
 * @example
 *
 * tl("3", parseInt);
 * // => 3
 *
 */
export function tl(x, ...fns) {
  return fns.reduceRight((acc, fn) => fn(acc), x);
}

/**
 * evaluates the test and returns then if true, otherwise if false
 *
 * @func
 * @param {*}
 * @param {*}
 * @param {*}
 * @return {*}
 * @example
 *
 * iff(1 > 2, "hello", "world");
 * "world"
 *
 * iff(3 > 2, str("hello", " world"), "world");
 * "hello world"
 *
 * iff(1 * 2 === 2, (() => 3 * 2)(), 7);
 * 6
 *
 */
export function iff(test, then, otherwise) {
  return test ? then : otherwise;
}

/**
 * takes a set of test / expression pairs. It evaluates each test one at a
 * time returning the result for the first true test
 *
 * @func
 * @param {...Array}
 * @return {function
 * @example
 *
 * function posNegOrZero(n) {
 *   return cond(
 *     [() => n < 0, () => "negative"],
 *     [() => n > 0, () => "positive"],
 *     [() => "else", () => "zero"]
 *   )();
 * }
 * posNegOrZero(5);
 * // => "positive"
 *
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

/**
 * groups variables in a single scope
 *
 * @func
 * @param {Array}
 * @param {function}
 * @return {*}
 * @example
 *
 * lett([["x", 3], ["y", 4], ["z", 55]], (xs) => {
 *   return (xs.x * xs.y) + xs.z;
 * });
 *
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

/**
 * evaluates expressions from left to right and returns the first
 * argument that is falsy or the last arg if all args are truthy
 *
 * @func
 * @param {...*}
 * @return {*}
 * @example
 *
 * and(true, true);
 * // => true
 *
 * and([], []);
 * // => []
 *
 * and(0, 1);
 * // => 1
 *
 */
export function and(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === null || args[i] === undefined || args[i] === false) {
      return args[i];
    }
  }

  return args[args.length - 1];
}

/**
 * returns the first argument that is truthy or the last argument
 * if all arguments are falsy
 *
 * @func
 * @param {...*}
 * @return {*}
 * @example
 *
 * or(true, false, false);
 * // => true
 *
 * or(null, null);
 * // => null
 *
 * or(false, 42);
 * // => 42
 *
 */
export function or(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== false && args[i] !== undefined && args[i] !== null) {
      return args[i];
    }
  }

  return args[args.length - 1];
}

/**
 * returns true if x is a number
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isNumber(1);
 * // => true
 *
 * isNumber("1");
 * // => false
 *
 * isNumber(+"1");
 * // => true
 *
 */
export function isNumber(x) {
  return typeof x === "number";
}

/**
 * returns true if x is an integer
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isInteger(1);
 * // => true
 *
 * isInteger(1.0);
 * // => true
 *
 * isInteger(3.4);
 * // => false
 *
 */
export function isInteger(x) {
  return Number.isInteger(x);
}

/**
 * returns true if x is a number
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isFloat(1);
 * // => true
 *
 * isFloat("1");
 * // => false
 *
 * isFloat(+"1");
 * // => true
 *
 */
export function isFloat(x) {
  return isNumber(x);
}

/**
 * returns true if x is a string
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isString(5);
 * // => false
 *
 * isString(true);
 * // => false
 *
 */
export function isString(x) {
  return typeof x === "string";
}

/**
 * returns true if x is a Map
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isMap([]);
 * // => false
 *
 * isMap(new Map());
 * // => true
 *
 * isMap({});
 * // => false
 *
 */
export function isMap(x) {
  return typeConst(x) === MAP_TYPE;
}

/**
 * returns true if x is an Object
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isObject([]);
 * // => false
 *
 * isObject(list());
 * // => false
 *
 * isObject({a: 2});
 * // => true
 *
 */
export function isObject(x) {
  return typeConst(x) === OBJECT_TYPE;
}

/**
 * returns true if x is a Set
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isSet("abc");
 * false
 *
 * isSet({});
 * false
 *
 * isSet(set());
 * true
 *
 */
export function isSet(x) {
  return typeConst(x) === SET_TYPE;
}

/**
 * returns true if x is a function
 *
 * @func
 * @param {*}
 * @return {boolean}
 * @example
 *
 * isFn(() => 1 + 1);
 * // => true
 *
 * isFn(isNil);
 * // => true
 *
 * isFn(1);
 * // => false
 *
 */
export function isFn(x) {
  return typePrimitive(x) === FUNCTION_TYPE;
}

/**
 * Internal function
 * _eq() is a helper for eq()
 *
 * @private
 *
 */
function _eq(x, y) {
  if (typeof y === "undefined") {
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
      if (!y.has(k) || !eq(v, y.get(k))) {
        return false;
      }
    }

    return true;
  }

  if (isInstance(List, x) || isInstance(List, y)) {
    try {
      return eq([...x], [...y]);
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
        if (!eq(x[i], y[i])) {
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
        if (!eq(x[k], y[k])) {
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

/**
 * compares x, y and args. Allows comparison of nested arrays and objects
 *
 * @func
 * @param {*}
 * @param {*}
 * @param {...*}
 * @return {boolean}
 * @example
 *
 * eq(5);
 * // => true
 *
 * eq(1, 2);
 * // => false
 *
 * eq(1, 1, 1);
 * // => true
 *
 * eq([1, 2], [1, 2], [1, 2]);
 * // => true
 *
 * eq([1, 2, [3, 4, [{a: "b"}]]], [1, 2, [3, 4, [{a: "b"}]]]);
 * // => true
 *
 */
export function eq(x, y, ...args) {
  if (not(isEmpty(args))) {
    let compare = [x, y, ...args];
    let firstv = first(compare);

    for (let i = 0; i < compare.length; i++) {
      if (!_eq(firstv, compare[i])) {
        return false;
      }
    }

    return true;
  }

  return _eq(x, y);
}

/**
 * the same as not(eq(x, y))
 *
 * @func
 * @param {*}
 * @param {*}
 * @param {...*}
 * @return {boolean}
 * @example
 *
 * notEq(1);
 * // => false
 *
 * notEq(1, 2);
 * // => true
 *
 * notEq([1, 2], [3, 4]);
 * // => true
 *
 */
export function notEq(x, y, ...args) {
  return not(eq(x, y, ...args));
}

/**
 * coerces x to an integer
 *
 * @func
 * @param {string|number}
 * @return {number}
 * @example
 *
 * int(1);
 * // => 1
 *
 * int(1.2);
 * // => 1
 *
 */
export function int(x) {
  return parseInt(x);
}

/**
 * returns a Symbol with the given name
 *
 * @func
 * @param {string}
 * @return {Symbol}
 * @example
 *
 * symbol("foo");
 * Symbol(foo)
 *
 */
export function symbol(name) {
  return Symbol(name);
}

/**
 * returns the name of a Symbol
 *
 * @func
 * @param {Symbol}
 * @return {string}
 * @example
 *
 * name(symbol("foo"));
 * // => "foo"
 *
 */
export function name(symbol) {
  return symbol.toString().slice(7, -1);
}

/**
 * returns function which returns true if all predicates are true, false otherwise
 *
 * @func
 * @param {...function}
 * @return {function}
 * @example
 *
 * everyPred(isNumber, isOdd)(3, 9, 1);
 * // true
 *
 * everyPred(isNumber, isEven)(3, 9, 1);
 * // false
 *
 * everyPred(isNumber, isOdd, isPos)(3, 9, 1);
 * // true
 *
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

/**
 * returns a lazy sequence of successive matches of pattern in a string
 *
 * @func
 * @param {RegExp}
 * @param {string}
 * @return {LazyIterable}
 * @example
 *
 * [...reSeq(/\d/g, "test 5.9.2")];
 * // => ["5", "9", "2"]
 *
 * [...reSeq(/\w+/g, "this is the story all about how")];
 * // => ["this", "is", "the",  "story", "all",  "about", "how"]
 *
 * [...reSeq(/(\S+):(\d+)/g, " RX pkts:18 err:5 drop:48")];
 * // => [["pkts:18", "pkts", "18"], ["err:5", "err", "5"], ["drop:48", "drop", "48"]]
 *
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

/**
 * coerces x to a float
 *
 * @func
 * @param {string|number}
 * @return {number}
 * @example
 *
 * float("1.5");
 * // => 1.5
 *
 * float(1);
 * // => 1
 *
 * float(1.4442);
 * // => 1.4442
 *
 */
export function float(x) {
  return parseFloat(x);
}

/**
 * returns the class of x
 *
 * @func
 * @param {*}
 * @return {Class}
 * @example
 *
 * classOf("hello");
 * // => [Function: String]
 *
 * classOf(false);
 * // => [Function: Boolean]
 *
 * classOf(1);
 * // => [Function: Number]
 *
 * classOf(function() {});
 * // => [Function: Function]
 *
 * classOf(new Map());
 * // => [Function: Map]
 *
 * classOf([]);
 * // => [Function: Array]
 *
 * classOf({});
 * // => [Function: Object]
 *
 * classOf(new List());
 * // => [class List extends Array]
 *
 * classOf(new Set);
 * // => [Function: Set]
 *
 * classOf(new LazyIterable);
 * // => [class LazyIterable]
 *
 */
export function classOf(x) {
  var a = typeConst(x);
  var b = typePrimitive(x);

  if (b === BOOLEAN_TYPE) {
    return Boolean;
  }

  if (b === NUMBER_TYPE) {
    return Number;
  }

  if (b === STRING_TYPE) {
    return String;
  }

  if (b === FUNCTION_TYPE) {
    return Function;
  }

  if (a === MAP_TYPE) {
    return Map;
  }

  if (a === ARRAY_TYPE) {
    return Array;
  }

  if (a === OBJECT_TYPE) {
    return Object;
  }

  if (a === LIST_TYPE) {
    return List;
  }

  if (a === SET_TYPE) {
    return Set;
  }

  if (a === LAZY_ITERABLE_TYPE) {
    return LazyIterable;
  }

  return null;
}

/**
 * returns a lazy sequence of x, f(x), f(f(x)) etc
 *
 * @func
 * @param {function}
 * @param {number}
 * @return {LazyIterable}
 * @example
 *
 * [...take(3, iterate(inc, 5))];
 * // => [5, 6, 7]
 *
 * [...take(10, iterate(partial(plus, 2), 0))];
 * // => [0,  2,  4,  6,  8, 10, 12, 14, 16, 18]
 *
 * [...take(20, iterate(partial(plus, 2), 0))];
 * // => [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38]
 *
 * var powersOfTwo = iterate(partial(multiply, 2), 1);
 * nth(powersOfTwo, 10);
 * // => 1024
 *
 * [...take(10, powersOfTwo)];
 * // => [1,  2, 4, 8, 16, 32, 64, 128, 256, 512]
 *
 * var fib = map(first, iterate(([a, b]) => [b, a + b], [0, 1]));
 * [...take(10, fib)];
 * // => [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
 *
 */
export function iterate(f, x) {
  return lazy(function* () {
    let result = x;

    while (true) {
      yield result;
      result = f(result);
    }
  });
}

/**
 * Returns the greatest of the numbers
 *
 * @func
 * @param {...number}
 * @return {number}
 * @example
 *
 * max(1, 2, 3, 4, 5);
 * // => 5
 *
 * apply(max, [1, 2, 3, 4, 3]);
 * // => 4
 *
 */
export function max(...args) {
  let val = args[0];

  for (let i = 0; i < args.length; i++) {
    if (args[i] > val) {
      val = args[i];
    }
  }

  return val;
}

/**
 * Returns the least of the numbers
 *
 * @func
 * @param {...number}
 * @return {number}
 * @example
 *
 * min(1, 2, 3, 4, 5);
 * // => 1
 *
 * min(5, 4, 3, 2, 1);
 * // => 1
 *
 */
export function min(...args) {
  let val = args[0];

  for (let i = 0; i < args.length; i++) {
    if (args[i] < val) {
      val = args[i];
    }
  }

  return val;
}
