import * as c from "../src/core.js";
import * as s from "../src/string.js";

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

    expect(s.join(", ", ["spam", null, "eggs", "", "spam"])).toBe("spam, , eggs, , spam");

    expect(s.join(", ", c.remove(s.blankQmark, ["spam", null, "eggs", "", "spam"]))).toBe("spam, eggs, spam");
  });
});

