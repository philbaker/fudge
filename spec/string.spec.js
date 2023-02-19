import * as c from "../core.js";
import * as s from "../string.js";

describe("isBlank", function () {
  it("returns true if s is null, empty or contains only whitespace", function () {
    expect(s.isBlank(null)).toBe(true);

    expect(s.isBlank("")).toBe(true);

    expect(s.isBlank("   ")).toBe(true);

    expect(s.isBlank("  a  ")).toBe(false);

    expect(s.isBlank(false)).toBe(true);

    expect(s.isBlank("\n")).toBe(true);
  });
});

describe("join", function () {
  it("returns a string of all elements in coll", function () {
    expect(s.join([1, 2, 3])).toBe("123");

    expect(s.join(", ", [1, 2, 3])).toBe("1, 2, 3");

    expect(s.join(", ", ["spam", null, "eggs", "", "spam"])).toBe(
      "spam, , eggs, , spam"
    );

    expect(
      s.join(", ", c.remove(s.isBlank, ["spam", null, "eggs", "", "spam"]))
    ).toBe("spam, eggs, spam");
  });
});

describe("trim", function () {
  it("removes whitespace from both ends of a string", function () {
    expect(s.trim("   a    ")).toBe("a");
  });
});

describe("triml", function () {
  it("removes whitespace from the start of a string", function () {
    expect(s.triml("   a")).toBe("a");
  });
});

describe("trimr", function () {
  it("removes whitespace from the end of a string", function () {
    expect(s.trimr("a    ")).toBe("a");
  });
});

describe("replace", function () {
  it("replaces all instances of match with replacement in s", function () {
    expect(s.replace("The color is red", /red/g, "blue")).toBe(
      "The color is blue"
    );

    expect(s.replace("banana and mango", "an", "um")).toBe("bumuma umd mumgo");
  });
});

describe("split", function () {
  it("works", function () {
    expect(s.split("q1w2e3r4t5y6u7i8o9p0", /\d+/)).toEqual([
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
    ]);

    expect(s.split("q1w2e3r4t5y6u7i8o9p0", /\d+/, -1)).toEqual([
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
      "",
    ]);

    expect(s.split("Hello world", " ")).toEqual(["Hello", "world"]);

    expect(s.split("JavaScript is awesome!", " ")).toEqual([
      "JavaScript",
      "is",
      "awesome!",
    ]);

    expect(s.split("q1w2e3r4t5y6u7i8o9p0", /\d+/, 5)).toEqual([
      "q",
      "w",
      "e",
      "r",
      "t5y6u7i8o9p0",
    ]);

    expect(s.split("fooxbarybaz", /[xy]/, 2)).toEqual(["foo", "barybaz"]);

    expect(s.split("foo--bar--baz", "--")).toEqual(["foo", "bar", "baz"]);

    expect(s.split(" q1w2 ", "")).toEqual([" ", "q", "1", "w", "2", " "]);

    expect(s.split("a", "b")).toEqual(["a"]);
  });
});

describe("lowerCase", function () {
  it("returns a lower case string", function () {
    expect(s.lowerCase("Hello")).toBe("hello");

    expect(s.lowerCase("ABCD")).toBe("abcd");
  });
});

describe("upperCase", function () {
  it("returns a upper case string", function () {
    expect(s.upperCase("Hello")).toBe("HELLO");

    expect(s.upperCase("abcd")).toBe("ABCD");
  });
});

describe("endsWith", function () {
  it("returns true if s ends with substring", function () {
    expect(s.endsWith("Minsun", "sun")).toBe(true);

    expect(s.endsWith("Minsun", "suns")).toBe(false);

    expect(s.endsWith("Minsun", "un")).toBe(true);
  });
});

describe("startsWith", function () {
  it("return true if s starts with substring", function () {
    expect(s.startsWith("abcde", "a")).toBe(true);

    expect(s.startsWith("abcde", "ab")).toBe(true);

    expect(s.startsWith("abcde", "abc")).toBe(true);

    expect(s.startsWith("abcde", "b")).toBe(false);

    expect(s.startsWith("abcde", "bc")).toBe(false);

    expect(s.startsWith("a", "ab")).toBe(false);

    expect(s.startsWith("ab", "abc")).toBe(false);
  });
});
