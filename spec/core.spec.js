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

describe("rest", function () {
  it("returns all but the first element", function () {
    expect([...fc.rest([1, 2, 3])]).toEqual([2, 3]);
  });

  it("returns an empty array if only one element in array", function () {
    expect([...fc.rest([1])]).toEqual([]);
  });

  it("returns an empty array when given an empty array", function () {
    expect([...fc.rest([])]).toEqual([]);
  });

  it("returns an empty array when given null", function () {
    expect([...fc.rest(null)]).toEqual([]);
  });

  it("returns an empty array when given undefined", function () {
    expect([...fc.rest(undefined)]).toEqual([]);
  });
});

describe("first", function () {
  it("returns first element in an array", function () {
    expect(fc.first([1, 2, 3])).toBe(1);
  });

  it("returns first character of a string", function () {
    expect(fc.first("abc")).toBe("a");
  });

  it("returns first key value pair of an object", function () {
    expect(fc.first({ name: "George", weight: 100 })).toEqual([
      "name",
      "George",
    ]);
  });

  it("returns null if array is empty", function () {
    expect(fc.first([])).toBe(null);
  });

  it("returns null if object is empty", function () {
    expect(fc.first({})).toBe(null);
  });

  it("returns null if string is empty", function () {
    expect(fc.first("")).toBe(null);
  });
});

describe("second", function () {
  it("returns second element of array", function () {
    expect(fc.second([1, 2, 3])).toBe(2);
  });

  it("returns second character of string", function () {
    expect(fc.second("abc")).toBe("b");
  });

  it("returns second element of array", function () {
    expect(fc.second({ name: "George", weight: 100 })).toEqual(["weight", 100]);
  });

  it("returns null if array is empty", function () {
    expect(fc.second([])).toBe(null);
  });

  it("returns null if second element of array does not exist", function () {
    expect(fc.second([1])).toBe(null);
  });

  it("returns null if object is empty", function () {
    expect(fc.second({})).toBe(null);
  });

  it("returns null if second element of object does not exist", function () {
    expect(fc.second({ name: "George" })).toBe(null);
  });

  it("returns null if string is empty", function () {
    expect(fc.second("")).toBe(null);
  });

  it("returns null if second character of string does not exist", function () {
    expect(fc.second("a")).toBe(null);
  });
});


describe("ffirst", function () {
  it("returns the first first element", function () {
    expect(fc.ffirst({name: "George", weight: 100})).toBe("name");
  });

  it("returns null for empty array", function () {
    expect(fc.ffirst([])).toBe(null);
  });

  it("returns null for empty object", function () {
    expect(fc.ffirst({})).toBe(null);
  });
});
