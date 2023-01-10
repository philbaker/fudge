import * as fc from "../src/core.js";

describe("seq", function () {
  it("returns null when given null", function () {
    expect(fc.seq(null)).toBe(null);
  });

  it("returns same array when given an array", function () {
    expect(fc.seq([1, 2])).toEqual([1, 2]);
  });

  it("returs an array of arrays when given an object", function () {
    expect(fc.seq({ name: "George", occupation: "Sofa tester" })).toEqual([
      ["name", "George"],
      ["occupation", "Sofa tester"],
    ]);
  });
});

describe("plus", function () {
  it("adds 1 + 2 to equal 3", function () {
    expect(fc.plus(1, 2)).toBe(3);
  });

  it("adds 1 + -2 to equal -1", function () {
    expect(fc.plus(1, -2)).toBe(-1);
  });
});
