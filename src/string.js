import { iterable } from "./core.js";

/*
blankQmark() returns true if s is null, empty or contains only whitespace

blankQmark(null);
true

blankQmark("");
true

*/
export function blankQmark(s) {
  if (!s) {
    return true;
  }

  if (s.length === 0) {
    return true;
  }

  if (s.trimLeft().length === 0) {
    return true;
  }

  return false;
}

/*
join() returns a string of all elements in coll

join([1, 2, 3]);
"123"

join(", ", [1, 2, 3]);
"1, 2, 3"

*/
export function join(sep, coll) {
  if (coll === undefined) {
    coll = sep;
    sep = "";
  }

  if (coll instanceof Array) {
    return coll.join(sep);
  }

  let ret = "";
  let addSep = false;

  for (const x of iterable(coll)) {
    if (addSep) {
      ret += sep;
    }

    ret += x;
    addSep = true;
  }

  return ret;
}

/*
trim() removes whitespace from both ends of a string

trim("   a    ");
"a"

*/
export function trim(s) {
  return s.trim();
}

/*
split() splits a string on regular expression

split("Hello world", " ");
[ 'Hello', 'world' ]

split("q1w2e3r4t5y6u7i8o9p0", /\d+/);
[ "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "" ]

split("q1w2e3r4t5y6u7i8o9p0", /\d+/, 5);
[ "q", "w", "e", "r", "t" ]

split(" q1w2 ", "");
[ " ", "q", "1", "w", "2", " " ]

split("a", "b");
[ "a" ]

*/
export function split(s, re, limit) {
  return s.split(re, limit);
}

/*
replace() replaces match with replacement

replace("The color is red red red", "red", "orange");
"The color is orange orange orange"

replace("The color is red red red", /red/g, "blue");
"The color is blue blue blue"

*/
export function replace(s, m, re) {
  return s.replaceAll(m, re);
}
