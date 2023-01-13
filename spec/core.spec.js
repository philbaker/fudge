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

describe("comp", function () {
  it("can be passed a single function", function () {
    expect(fc.comp(fc.isZero)(5)).toBe(false);
  });

  it("composes multiple functions", function () {
    expect(fc.comp(fc.str, fc.plus)(8, 8, 8)).toBe("24");
  });

  it("returns its argument if one argument passed", function () {
    expect(fc.comp(fc.str)).toBe(fc.str);
    expect(fc.comp(null)).toBe(null);
  });

  it("returns the function identity if no arguments passed", function () {
    expect(fc.comp()).toBe(fc.identity);
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
      "Illegal argument: assoc! expects a Map, Array or Object as the first argument."
    );
  });
});

describe("assoc", function () {
  it("it does not mutate original variable", function () {
    var arrData = [1, 2, 5, 6, 8, 9];
    expect(arrData).toEqual([1, 2, 5, 6, 8, 9]);
  });

  it("returns a new map with modified values", function () {
    var mapData = new Map();
    mapData.set(0, "zero");
    var updatedMap = fc.assoc(mapData, 1, "one");
    expect(updatedMap.get(1)).toEqual("one");
    expect(updatedMap.size).toEqual(2);
  });

  it("returns a new array with modified values", function () {
    expect(fc.assocBang([1, 2, 5, 6, 8, 9], 0, 77)).toEqual([
      77, 2, 5, 6, 8, 9,
    ]);
  });

  it("returns a new object with modified values", function () {
    var objData = fc.assoc(
      { name: "George", occupation: "Sofa tester" },
      "foodPreference",
      "fish"
    );
    expect(objData).toEqual({
      name: "George",
      occupation: "Sofa tester",
      foodPreference: "fish",
    });
  });

  it("returns a new object if falsy value passed", function () {
    expect(fc.assoc(null, 0, "hi")).toEqual({ 0: "hi" });
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      fc.assoc(5, 0, "hi");
    }).toThrowError(
      "Illegal argument: assoc expects a Map, Array or Object as the first argument."
    );
  });
});

describe("assocInBang", function () {
  it("associates a value in a nested map by mutating value", function () {
    var petsMap = new Map();
    petsMap.set(0, { name: "George", age: 12 });
    petsMap.set(1, { name: "Lola", age: 11 });
    fc.assocInBang(petsMap, [0, "age"], 13);
    expect(petsMap.get(0).age).toEqual(13);
  });

  it("associates a value in a nested array by mutating value", function () {
    var nums = [1, 2, 3, [4, 5, 6]];

    expect(fc.assocInBang(nums, [3, 0], 100)).toEqual([1, 2, 3, [100, 5, 6]]);
  });

  it("associates a value in a nested object by mutating value", function () {
    var pets = [
      { name: "George", age: 12 },
      { name: "Lola", age: 11 },
    ];

    fc.assocInBang(pets, [0, "age"], 13);

    expect(pets).toEqual([
      { name: "George", age: 13 },
      { name: "Lola", age: 11 },
    ]);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      fc.assocInBang(5, [0, "age"], 13);
    }).toThrowError(
      "Illegal argument: assocIn! expects a Map, Array or Object as the first argument."
    );
  });
});

describe("assocIn", function () {
  it("associates a value in a nested map and returns a new map", function () {
    var petsMap = new Map();
    petsMap.set(0, { name: "George", age: 12 });
    petsMap.set(1, { name: "Lola", age: 11 });
    var newPetsMap = fc.assocIn(petsMap, [0, "age"], 13);
    expect(petsMap.get(0).age).toEqual(12);
    expect(newPetsMap.get(0).age).toEqual(13);
  });

  it("associates a value in a nested array and returns a new array", function () {
    var nums = [1, 2, 3, [4, 5, 6]];
    expect(nums).toEqual([1, 2, 3, [4, 5, 6]]);
    expect(fc.assocIn(nums, [3, 0], 100)).toEqual([1, 2, 3, [100, 5, 6]]);
  });

  it("associates a value in a nested object and returns a new object", function () {
    var pets = [
      { name: "George", age: 12 },
      { name: "Lola", age: 11 },
    ];
    var newPets = fc.assocIn(pets, [0, "age"], 13);
    expect(pets).toEqual([
      { name: "George", age: 12 },
      { name: "Lola", age: 11 },
    ]);
    expect(newPets).toEqual([
      { name: "George", age: 13 },
      { name: "Lola", age: 11 },
    ]);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      fc.assocIn(5, [0, "age"], 13);
    }).toThrowError(
      "Illegal argument: assocIn expects a Map, Array or Object as the first argument."
    );
  });
});

describe("conjBang", function () {
  it("returns an empty array if no arguments passed", function () {
    expect(fc.conjBang()).toEqual([]);
  });

  it("adds to the end of an array by mutation", function () {
    var conjArr = [1, 2, 3];
    fc.conjBang(conjArr, 4);

    expect(conjArr).toEqual([1, 2, 3, 4]);
  });

  it("adds multiple items in argument order to the end of an array by mutation", function () {
    var conjArr = [1, 2];
    fc.conjBang(conjArr, 3, 4);

    expect(conjArr).toEqual([1, 2, 3, 4]);
  });

  it("adds to the start of a List by mutation", function () {
    var conjList = new fc.List(1, 2, 3);
    fc.conjBang(conjList, 4);

    expect(conjList).toEqual([4, 1, 2, 3]);
  });

  it("adds to the end of an object by mutation", function () {
    var conjObj = { name: "George", coat: "Tabby" };
    fc.conjBang(conjObj, { age: 12, nationality: "British" });

    expect(conjObj).toEqual({
      name: "George",
      coat: "Tabby",
      age: 12,
      nationality: "British",
    });
  });

  it("adds to a set by mutation", function () {
    var conjSet = new Set([1, 2, 3]);

    fc.conjBang(conjSet, 4);

    expect(conjSet.has(4)).toBe(true);
  });

  it("adds to a map by mutation", function () {
    var conjMap = new Map();
    conjMap.set("name", "George");
    conjMap.set("coat", "Tabby");

    fc.conjBang(conjMap, { age: 12, nationality: "British" });

    expect(conjMap.get("age")).toBe(12);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      fc.conjBang(5, ["hello"]);
    }).toThrowError(
      "Illegal argument: conj! expects a Set, Array, List, Map, or Object as the first argument."
    );
  });
});

describe("conj", function () {
  it("returns an empty array if no arguments passed", function () {
    expect(fc.conj()).toEqual([]);
  });

  it("adds to the end of an array", function () {
    expect(fc.conj([1, 2, 3], 4)).toEqual([1, 2, 3, 4]);
  });

  it("does not mutate the original array", function () {
    var conjArr = [1, 2, 3];
    fc.conj(conjArr, 4);

    expect(conjArr).toEqual([1, 2, 3]);
  });

  it("adds multiple items in argument order to the end of an array", function () {
    expect(fc.conj([1, 2], 3, 4)).toEqual([1, 2, 3, 4]);
  });

  it("adds to the start of a List", function () {
    var conjList = new fc.List(1, 2, 3);
    expect(fc.conj(conjList, 4)).toEqual([4, 1, 2, 3]);
  });

  it("adds to the end of an object", function () {
    expect(
      fc.conj(
        { name: "George", coat: "Tabby" },
        { age: 12, nationality: "British" }
      )
    ).toEqual({
      name: "George",
      coat: "Tabby",
      age: 12,
      nationality: "British",
    });
  });

  it("adds to a set", function () {
    var conjSet = new Set([1, 2, 3]);

    var newConjSet = fc.conj(conjSet, 4);

    expect(newConjSet.has(4)).toBe(true);
  });

  it("adds to a map", function () {
    var conjMap = new Map([
      ["name", "George"],
      ["coat", "Tabby"],
    ]);

    var newConjMap = fc.conj(conjMap, { age: 12, nationality: "British" });

    expect(newConjMap.get("age")).toBe(12);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      fc.conj(5, ["hello"]);
    }).toThrowError(
      "Illegal argument: conj expects a Set, Array, List, Map, or Object as the first argument."
    );
  });
});

describe("disjBang", function () {
  it("removes an item from a set by mutation", function () {
    var disjSet = new Set(["a", "b", "c"]);
    fc.disjBang(disjSet, "b");

    expect(disjSet.has("b")).toBeFalse();
  });

  it("removes multiple items from set", function () {
    var disjSet = new Set(["a", "b", "c"]);
    fc.disjBang(disjSet, "a", "b");

    expect(disjSet.has("a")).toBeFalse();
    expect(disjSet.has("b")).toBeFalse();
  });
});

describe("disjBang", function () {
  it("does not mutate the original set", function () {
    var disjSet = new Set(["a", "b", "c"]);
    var newDisjSet = fc.disj(disjSet, "b");

    expect(disjSet.has("b")).toBeTrue();
    expect(newDisjSet.has("b")).toBeFalse();
  });

  it("removes multiple items from set without mutation", function () {
    var disjSet = new Set(["a", "b", "c"]);
    var newDisjSet = fc.disj(disjSet, "a", "b");

    expect(disjSet.has("a")).toBeTrue();
    expect(disjSet.has("b")).toBeTrue();
    expect(newDisjSet.has("a")).toBeFalse();
    expect(newDisjSet.has("b")).toBeFalse();
  });
});

describe("contains", function () {
  it("checks for array index as key", function () {
    expect(fc.contains([1, 2, 3], 0)).toBe(true);
    expect(fc.contains([1, 2, 3], 3)).toBe(false);
  });

  it("checks objects by key", function () {
    expect(fc.contains({ name: "George", salary: "Biscuits" }, "name")).toBe(
      true
    );
  });

  it("checks for items in a set", function () {
    expect(fc.contains(new Set(["a", "b", "c"]), "b")).toBe(true);
  });

  it("checks for items in a map", function () {
    var containsMap = new Map();
    containsMap.set("name", "George");
    containsMap.set("salary", "Biscuits");

    expect(fc.contains(containsMap, "salary")).toBe(true);
  });
});

describe("dissocBang", function () {
  it("removes items from an object by mutation", function () {
    var dissocObj = { name: "George", salary: "Biscuits" };

    expect(fc.dissocBang(dissocObj, "name")).toEqual({ salary: "Biscuits" });
  });

  it("removes multiple items from an object", function () {
    var dissocObj = { name: "George", salary: "Biscuits" };

    expect(fc.dissocBang(dissocObj, "name", "salary")).toEqual({});
  });
});

describe("dissoc", function () {
  it("does not mutate the original object", function () {
    var dissocObj = { name: "George", salary: "Biscuits" };
    var newDissocObj = fc.dissoc(dissocObj, "name");

    expect(dissocObj).toEqual({ name: "George", salary: "Biscuits" });
    expect(newDissocObj).toEqual({ salary: "Biscuits" });
  });

  it("removes multiple items from an object without mutation", function () {
    expect(
      fc.dissoc({ name: "George", salary: "Biscuits" }, "name", "salary")
    ).toEqual({});
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

describe("get", function () {
  it("returns value from array based on key provided", function () {
    expect(fc.get([1, 2, 3], 1)).toBe(2);
  });

  it("returns null if key not present", function () {
    expect(fc.get([1, 2, 3], 5)).toBe(null);
  });

  it("returns value from object based on key provided", function () {
    expect(fc.get({ a: 1, b: 2 }, "b")).toBe(2);
  });

  it("returns notFound if key provided is not present", function () {
    expect(fc.get({ a: 1, b: 2 }, "z", "missing")).toBe("missing");
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
    expect(function () {
      fc.isEven(null);
    }).toThrowError("Illegal argument: null is not a number");
  });
});

describe("isOdd", function () {
  it("returns true if x is odd", function () {
    expect(fc.isOdd(3)).toBe(true);
  });

  it("throws an error if x is not a number", function () {
    expect(function () {
      fc.isOdd(null);
    }).toThrowError("Illegal argument: null is not a number");
  });
});

describe("complement", function () {
  it("returns the opposite truth value", function () {
    var testIsOdd = fc.complement(fc.isEven);
    expect(testIsOdd(3)).toBe(true);
  });
});

describe("partial", function () {
  it("It returns a function that takes a variable number of additional args", function () {
    var hundredPlus = fc.partial(fc.plus, 100);
    expect(hundredPlus(5)).toBe(105);
  });
});

describe("sort", function () {
  it("returns a sorted sequence of the items in coll", function () {
    expect(fc.sort([3, 4, 1, 2])).toEqual([1, 2, 3, 4]);
    expect(fc.sort((a, b) => b - a, [3, 4, 1, 2])).toEqual([4, 3, 2, 1]);
  });
});

describe("isSome", function () {
  it("returns true if x is not null or undefined, false otherwise", function () {
    expect(fc.isSome(1 < 5)).toBe(true);
    expect(fc.isSome(null)).toBe(false);
    expect(fc.isSome(undefined)).toBe(false);
  });
});

describe("threadFirst", function () {
  it("threads x through the fns with x as the second argument", function () {
    expect(fc.threadFirst("3", parseInt)).toBe(3);
  });
});

describe("threadLast", function () {
  it("threads x through the fns with x as the last argument", function () {
    expect(fc.threadLast("3", parseInt)).toBe(3);
  });
});
