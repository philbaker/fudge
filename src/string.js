import { iterable, last } from "./core.js";

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

export function replace(s, m, re) {
  return s.replaceAll(m, re);
}

/*
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

