import * as c from "../src/core.js";
import * as s from "../src/string.js";
import * as e from "../src/experimental.js";

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
    expect(e.split("q1w2e3r4t5y6u7i8o9p0", /\d+/)).toEqual([
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

    expect(e.split("q1w2e3r4t5y6u7i8o9p0", /\d+/, -1)).toEqual([
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

    expect(e.split("Hello world", " ")).toEqual(["Hello", "world"]);

    expect(e.split("JavaScript is awesome!", " ")).toEqual([
      "JavaScript",
      "is",
      "awesome!",
    ]);

    expect(e.split("q1w2e3r4t5y6u7i8o9p0", /\d+/, 5)).toEqual([
      "q",
      "w",
      "e",
      "r",
      "t5y6u7i8o9p0",
    ]);

    expect(e.split("fooxbarybaz", /[xy]/, 2)).toEqual(["foo", "barybaz"]);

    expect(e.split("foo--bar--baz", "--")).toEqual(["foo", "bar", "baz"]);

    expect(e.split(" q1w2 ", "")).toEqual([" ", "q", "1", "w", "2", " "]);

    expect(e.split("a", "b")).toEqual(["a"]);
  });
});
