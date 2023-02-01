import * as c from "../core.js";
import * as s from "../string.js";

describe("blankQmark", function () {
  it("returns true if s is null, empty or contains only whitespace", function () {
    expect(s.blankQmark(null)).toBe(true);

    expect(s.blankQmark("")).toBe(true);

    expect(s.blankQmark("   ")).toBe(true);

    expect(s.blankQmark("  a  ")).toBe(false);

    expect(s.blankQmark(false)).toBe(true);

    expect(s.blankQmark("\n")).toBe(true);
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
      s.join(", ", c.remove(s.blankQmark, ["spam", null, "eggs", "", "spam"]))
    ).toBe("spam, eggs, spam");
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
