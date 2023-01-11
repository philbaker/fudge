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
    expect(fc.ffirst({ name: "George", weight: 100 })).toBe("name");
  });

  it("returns null for empty array", function () {
    expect(fc.ffirst([])).toBe(null);
  });

  it("returns null for empty object", function () {
    expect(fc.ffirst({})).toBe(null);
  });
});

describe("assocBang", function () {
  it("adds a value to a map via mutation", function () {
    var mapData = new Map();
    mapData.set(0, "zero");
    fc.assocBang(mapData, 1, "one");
    expect(mapData.get(1)).toEqual("one");
    expect(mapData.size).toEqual(2);
  });

  it("adds a value to an array via mutation", function () {
    var arrData = [1, 2, 5, 6, 8, 9];
    expect(fc.assocBang(arrData, 0, 77)).toEqual([77, 2, 5, 6, 8, 9]);
  });

  it("adds a value to an object via mutation", function () {
    var objData = { name: "George", occupation: "Sofa tester" };
    fc.assocBang(objData, "foodPreference", "fish");
    expect(objData).toEqual({
      name: "George",
      occupation: "Sofa tester",
      foodPreference: "fish",
    });
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      fc.assocBang("", 0, "hi");
    }).toThrowError(
      "Illegal argument: assoc! expects a Map, Array, or Object as the first argument."
    );
  });
});

describe("plus", function () {
  it("adds two numbers", function () {
    expect(fc.plus(1, 2)).toBe(3);
  });

  it("adds multiple numbers", function () {
    expect(fc.plus(1, 2, 50)).toBe(53);
  });

  it("works with negative numbers", function () {
    expect(fc.plus(1, -2)).toBe(-1);
  });

  it("works with decimal numbers", function () {
    expect(fc.plus(1.5, 1)).toBe(2.5);
  });
});

describe("minus", function () {
  it("adds two numbers", function () {
    expect(fc.minus(2, 1)).toBe(1);
  });

  it("adds multiple numbers", function () {
    expect(fc.minus(5, 1, 2)).toBe(2);
  });

  it("works with negative numbers", function () {
    expect(fc.minus(1, -2)).toBe(3);
  });

  it("works with decimal numbers", function () {
    expect(fc.minus(1.5, 1)).toBe(0.5);
  });
});

describe("identity", function () {
  it("returns its argument", function () {
    expect(fc.identity([1])).toEqual([1]);
  });
});

describe("inc", function () {
  it("returns a number one greater than n", function () {
    expect(fc.inc(5)).toBe(6);
  });
});

describe("dec", function () {
  it("returns a number one less than n", function () {
    expect(fc.dec(5)).toBe(4);
  });
});

describe("nth", function () {
  it("returns value from array based on index given", function () {
    expect(fc.nth(["a", "b", "c", "d"], 0)).toBe("a");
  });

  it("returns undefined if no element is found and no notFound argument is provided", function () {
    expect(fc.nth([], 0)).toBe(undefined);
  });

  it("returns notFound if no element is found and notFound argument is provided", function () {
    expect(fc.nth([], 0, "nothing found")).toBe("nothing found");
  });
});

describe("str", function () {
  it("returns an empty string when no argument provided", function () {
    expect(fc.str()).toBe("");
  });

  it("returns an empty string when null passed as argument", function () {
    expect(fc.str(null)).toBe("");
  });

  it("converts a number into a string", function () {
    expect(fc.str(1)).toBe("1");
  });

  it("concatenates multiple arguments", function () {
    expect(fc.str(1, 2, 3)).toBe("123");
    expect(fc.str("L", 5, "a")).toBe("L5a");
  });
});

describe("not", function () {
  it("returns true if x is logical false, false otherwise", function () {
    expect(fc.not(true)).toBe(false);
    expect(fc.not(false)).toBe(true);
    expect(fc.not(null)).toBe(true);
    expect(fc.not(undefined)).toBe(true);
    expect(fc.not(1)).toBe(false);
  });
});

describe("isNil", function () {
  it("returns true if x is null, false otherwise", function () {
    expect(fc.isNil(null)).toBe(true);
    expect(fc.isNil(false)).toBe(false);
    expect(fc.isNil(true)).toBe(false);
  });
});

describe("vector", function () {
  it("creates a new array containing arguments given", function () {
    expect(fc.vector()).toEqual([]);
    expect(fc.vector(null)).toEqual([null]);
    expect(fc.vector(1, 2, 3)).toEqual([1, 2, 3]);
  });
});

describe("apply", function () {
  it("apply() applies fn f to the argument list formed by prepending intervening arguments to args", function () {
    expect(fc.apply(fc.str, ["str1", "str2", "str3"])).toBe("str1str2str3");
  });
});

describe("isEven", function () {
  it("returns true if x is even", function () {
    expect(fc.isEven(2)).toBe(true);
  });

  it("throws an error if x is not a number", function () {
    expect(function() { fc.isEven(null) }).toThrowError("Illegal argument: null is not a number");
  });
});
