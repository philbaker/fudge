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
  return val == null;
}

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
  return x % 2 == 0;
}
// isEven(2);
// true

export function isOdd(x) {
  return !isEven(x);
}
// isOdd(2);
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
// sort([3, 4, 1, 2]);
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
  return !(x === null || x === undefined);
}
// isSome(true);
// true
