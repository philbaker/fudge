/** @module string */

import { iterable, last } from "./core.js";

/**
 * returns true if s is null, empty or contains only whitespace
 *
 * @func
 * @param {string}
 * @return {boolean}
 * @example
 *
 * isBlank(null);
 * // => true
 *
 * isBlank("");
 * // => true
 *
 */
export function isBlank(s) {
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

/**
 * returns a string of all elements in coll
 *
 * @func
 * @param {*}
 * @param {*}
 * @return {string}
 * @example
 *
 * join([1, 2, 3]);
 * // => "123"
 *
 * join(", ", [1, 2, 3]);
 * // => "1, 2, 3"
 *
 * join("-", split("hello world", " "));
 * // => "hello-world"
 *
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

/**
 * removes whitespace from both ends of a string
 *
 * @func
 * @param {string}
 * @return {string}
 * @example
 *
 * trim("   a    ");
 * "a"
 *
 */
export function trim(s) {
  return s.trim();
}

/**
 * replaces all instances of match with replacement in s
 *
 * @func
 * @param {string}
 * @param {string|RegExp}
 * @param {string}
 * @return {string}
 * @example
 *
 * replace("The color is red", /red/g, "blue");
 * // => "The color is blue"
 *
 * replace("banana and mango", "an", "um");
 * // => "bumuma umd mumgo"
 *
 */
export function replace(s, match, replacement) {
  return s.replaceAll(match, replacement);
}

/**
 * splits a string on regular expression. JavaScript's limit works
 * differently to Java's. This implementation mimics Java's.
 *
 * @func
 * @param {string}
 * @return {string|RegExp}
 * @return {number}
 * @example
 *
 * split("Hello world", " ");
 * // => ["Hello", "world"]
 *
 * split("JavaScript is awesome!", " ")
 * // => ["JavaScript", "is", "awesome!"]
 *
 * split("q1w2e3r4t5y6u7i8o9p0", /\d+/);
 * // => ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", ""]
 *
 * split("q1w2e3r4t5y6u7i8o9p0", /\d+/, -1);
 * // => ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", ""]
 *
 * split("q1w2e3r4t5y6u7i8o9p0", /\d+/, 5);
 * // => ["q", "w", "e", "r", "t5y6u7i8o9p0"]
 *
 * split("q1w2e3r4t5y6u7i8o9p0", /\d+/, -1);
 * // => ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", ""]
 *
 * split("fooxbarybaz", /[xy]/, 2)
 * // => ["foo", "barybaz"]
 *
 * split(" q1w2 ", "");
 * // => [" ", "q", "1", "w", "2", " "]
 *
 * split("a", "b");
 * // => ["a"]
 *
 * split("hello world", " ");
 * // => ["hello", "world"]
 *
 * split("foo--bar--baz", "--");
 * // => ["foo", "bar", "baz"]
 *
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

/**
 * returns a string set to lower case
 *
 * @func
 * @param {string}
 * @return {string}
 * @example
 *
 * lowerCase("Hello");
 * // => "hello"
 *
 * lowerCase("ABCD");
 * // => "abcd"
 *
 */
export function lowerCase(s) {
  return s.toLowerCase();
}

/**
 * returns a string set to upper case
 *
 * @func
 * @param {string}
 * @return {string}
 * @example
 *
 * upperCase("Hello");
 * // => "HELLO"
 *
 * upperCase("abcd");
 * // => "ABCD"
 *
 */
export function upperCase(s) {
  return s.toUpperCase();
}

/**
 * return true if s ends with substring
 *
 * @func
 * @param {string}
 * @return {string}
 * @example
 *
 * endsWith("Minsun", "sun");
 * // true
 *
 * endsWith("Minsun", "suns");
 * // false
 *
 * endsWith("Minsun", "un")
 * // true
 *
 */
export function endsWith(s, substring) {
  return s.endsWith(substring);
}
