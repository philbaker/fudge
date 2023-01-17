import * as fc from "../src/core.js";

describe("concat", function () {
  it("returns a lazy sequence of concatenated elements from coll", function () {
    expect([...fc.concat([1, 2], [3, 4])]).toEqual([1, 2, 3, 4]);

    expect([...fc.concat(["a", "b"], null, [1, [2, 3], 4])]).toEqual([
      "a",
      "b",
      1,
      [2, 3],
      4,
    ]);

    expect([
      ...fc.concat([1], [2], fc.list(3, 4), [5, 6, 7], fc.set([9, 10, 8])),
    ]).toEqual([1, 2, 3, 4, 5, 6, 7, 9, 10, 8]);
  });
});

describe("mapcat", function () {
  it("applies concat to the result of applying map to f and colls", function () {
    expect([
      ...fc.mapcat(fc.reverse, [
        [3, 2, 1, 0],
        [6, 5, 4],
        [9, 8, 7],
      ]),
    ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect([...fc.mapcat(fc.list, ["a", "b", "c"], [1, 2, 3])]).toEqual([
      "a",
      1,
      "b",
      2,
      "c",
      3,
    ]);

    expect([
      ...fc.mapcat(function (x) {
        return [x, 2 * x];
      }, fc.range(5)),
    ]).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8]);
  });
});

describe("interleave", function () {
  it("returns first item in coll, then second etc", function () {
    expect([...fc.interleave(["a", "b", "c"], [1, 2, 3])]).toEqual([
      "a",
      1,
      "b",
      2,
      "c",
      3,
    ]);

    expect([...fc.interleave(["a", "b", "c"], [1, 2])]).toEqual([
      "a",
      1,
      "b",
      2,
    ]);

    expect([...fc.interleave(["a", "b"], [1, 2, 3])]).toEqual(["a", 1, "b", 2]);
  });
});

describe("interpose", function () {
  it("returns a lazy sequence of the elements of coll separated by sep", function () {
    expect([...fc.interpose(", ", ["one", "two", "three"])]).toEqual([
      "one",
      ", ",
      "two",
      ", ",
      "three",
    ]);

    expect(fc.apply(fc.str, fc.interpose(", ", ["one", "two", "three"]))).toBe(
      "one, two, three"
    );
  });
});

describe("selectKeys", function () {
  it("returns a map containing only those entries in the map whose key is in keys", function () {
    expect(fc.selectKeys({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });

    expect(fc.selectKeys({ a: 1, b: 2 }, ["a", "c"])).toEqual({ a: 1 });

    expect(fc.selectKeys({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({
      a: 1,
      c: 3,
    });
  });
});

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

describe("cons", function () {
  it("returns x as the first item and coll as the rest", function () {
    expect([...fc.cons(1, [2, 3, 4, 5, 6])]).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...fc.cons([1, 2], [4, 5, 6])]).toEqual([[1, 2], 4, 5, 6]);
  });
});

describe("map", function () {
  it("applies a given function to each element of a collection", function () {
    expect([...fc.map(fc.inc, [1, 2, 3, 4, 5])]).toEqual([2, 3, 4, 5, 6]);

    expect([...fc.map(fc.last, { x: 1, y: 2, z: 3 })]).toEqual([1, 2, 3]);

    expect([
      ...fc.map(function (item) {
        return item.toUpperCase();
      }, "hello"),
    ]).toEqual(["H", "E", "L", "L", "O"]);

    var months = ["jan", "feb", "mar"];
    var temps = [5, 7, 12];
    function unify(month, temp) {
      return {
        month,
        temp,
      };
    }
    expect([...fc.map(unify, months, temps)]).toEqual([
      { month: "jan", temp: 5 },
      { month: "feb", temp: 7 },
      { month: "mar", temp: 12 },
    ]);

    expect([...fc.map(fc.vector, [1, 2, 3, 4], ["a", "b", "c", "d"])]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
      [4, "d"],
    ]);
  });
});

describe("filter", function () {
  it("filters an array", function () {
    expect([
      ...fc.filter(fc.evenQmark, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    ]).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it("filters an object", function () {
    expect([
      ...fc.filter(
        function (key, val) {
          return fc.evenQmark(+key[0]);
        },
        { 1: "a", 2: "b", 3: "c", 4: "d" }
      ),
    ]).toEqual([
      ["2", "b"],
      ["4", "d"],
    ]);
  });
});

describe("filterv", function () {
  it("filters an array", function () {
    expect(
      fc.filterv(fc.evenQmark, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    ).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it("filters an object", function () {
    expect(
      fc.filterv(
        function (key, val) {
          return fc.evenQmark(+key[0]);
        },
        { 1: "a", 2: "b", 3: "c", 4: "d" }
      )
    ).toEqual([
      ["2", "b"],
      ["4", "d"],
    ]);
  });
});

describe("remove", function () {
  it("filters an array", function () {
    expect([
      ...fc.remove(fc.evenQmark, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    ]).toEqual([1, 3, 5, 7, 9]);
  });

  it("filters an object", function () {
    expect([
      ...fc.remove(
        function (key, val) {
          return fc.evenQmark(+key[0]);
        },
        { 1: "a", 2: "b", 3: "c", 4: "d" }
      ),
    ]).toEqual([
      ["1", "a"],
      ["3", "c"],
    ]);
  });
});

describe("mapIndexed", function () {
  it("returns an indexed array with each item in a collection", function () {
    expect(
      fc.mapIndexed(function (index, item) {
        return [index, item];
      }, "foobar")
    ).toEqual([
      [0, "f"],
      [1, "o"],
      [2, "o"],
      [3, "b"],
      [4, "a"],
      [5, "r"],
    ]);

    expect(fc.mapIndexed(fc.vector, "foobar")).toEqual([
      [0, "f"],
      [1, "o"],
      [2, "o"],
      [3, "b"],
      [4, "a"],
      [5, "r"],
    ]);
  });
});

describe("comp", function () {
  it("can be passed a single function", function () {
    expect(fc.comp(fc.zeroQmark)(5)).toBe(false);
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

describe("last", function () {
  it("returns the last item in an array", function () {
    expect(fc.last([1, 2, 3, 4, 5])).toBe(5);
    expect(fc.last(["a", "b", "c", "d", "e"])).toBe("e");
  });

  it("returns the last item in an object", function () {
    expect(fc.last({ one: 1, two: 2, three: 3 })).toEqual(["three", 3]);
  });

  it("returns null if given an empty collection", function () {
    expect(fc.last([])).toBe(null);
    expect(fc.last({})).toBe(null);
  });
});

describe("reduced", function () {
  it("wraps x so that reduce will terminate the value with x", function () {
    expect(
      fc.reduce(function (a, v) {
        return fc.plus(a, v);
      }, fc.range(10))
    ).toBe(45);

    expect(
      fc.reduce(function (a, v) {
        if (a < 100) {
          return fc.plus(a, v);
        } else {
          return fc.reduced("big");
        }
      }, fc.range(10))
    ).toBe(45);

    expect(
      fc.reduce(function (a, v) {
        if (a < 100) {
          return fc.plus(a, v);
        } else {
          return fc.reduced("big");
        }
      }, fc.range(20))
    ).toBe("big");
  });
});

describe("reduce", function () {
  it("sums numbers in an array", function () {
    expect(fc.reduce(fc.plus, [1, 2, 3, 4, 5])).toBe(15);
    expect(fc.reduce(fc.plus, [1])).toBe(1);
    expect(fc.reduce(fc.plus, [1, 2])).toBe(3);
    expect(fc.reduce(fc.plus, 1, [])).toBe(1);
    expect(fc.reduce(fc.plus, 1, [2, 3])).toBe(6);
  });

  it("works with other functions", function () {
    expect(fc.reduce(fc.conj, [1, 2, 3], [4, 5, 6])).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(fc.reduce(fc.str, "hello ", "world")).toBe("hello world");
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
  it("returns 0 if no argument provided", function () {
    expect(fc.plus()).toBe(0);
  });

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

describe("nilQmark", function () {
  it("returns true if x is null, false otherwise", function () {
    expect(fc.nilQmark(null)).toBe(true);
    expect(fc.nilQmark(false)).toBe(false);
    expect(fc.nilQmark(true)).toBe(false);
  });
});

describe("prStr", function () {
  it("turns a collection into a string and returns it", function () {
    expect(fc.prStr([1, 2, 3, 4, 5])).toBe("[1,2,3,4,5]");

    expect(fc.prStr({ name: "George", salary: "Biscuits" })).toBe(
      '{"name":"George","salary":"Biscuits"}'
    );

    var petsMap = new Map();
    petsMap.set(0, { name: "George", age: 12 });
    petsMap.set(1, { name: "Lola", age: 11 });

    expect(fc.prStr(petsMap)).toBe(
      '{"0":{"name":"George","age":12},"1":{"name":"Lola","age":11}}'
    );

    expect(fc.prStr(new Set([1, 2, 3]))).toBe("[1,2,3]");

    expect(fc.prStr(fc.cons(1, [2, 3, 4, 5, 6]))).toBe("[1,2,3,4,5,6]");
  });
});

describe("Atoms", function () {
  it("allows creation, updating and resetting of atoms", function () {
    var myAtom = fc.atom(0);

    expect(myAtom.value).toBe(0);

    expect(fc.swapBang(myAtom, fc.inc)).toBe(1);

    expect(
      fc.swapBang(myAtom, function (n) {
        return (n + n) * 2;
      })
    ).toBe(4);

    fc.resetBang(myAtom, 0);

    expect(myAtom.value).toBe(0);
  });
});

describe("range", function () {
  it("returns an array with numbers from range specified", function () {
    expect([...fc.range(10)]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect([...fc.range(-5, 5)]).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]);

    expect([...fc.range(-100, 100, 10)]).toEqual([
      -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50,
      60, 70, 80, 90,
    ]);

    expect([...fc.range(0, 4, 2)]).toEqual([0, 2]);
  });
});

describe("reMatches", function () {
  it("returns null if no match found", function () {
    expect(fc.reMatches(/hello/gi, "hello, world")).toBe(null);
  });

  it("returns a single match as a string", function () {
    expect(fc.reMatches(/hello, world/gi, "hello, world")).toBe("hello, world");
    expect(fc.reMatches(/hello.*/gi, "hello, world")).toBe("hello, world");
    expect(fc.reMatches(/ab.*/g, "abbcdefabh")).toBe("abbcdefabh");
  });

  it("returns multiple matches in an array", function () {
    expect(
      fc.reMatches(
        /quick\s(?<color>brown).+?(jumps)/dgi,
        "The Quick Brown Fox Jumps Over The Lazy Dog"
      )
    ).toEqual(["Quick Brown Fox Jumps", "Brown", "Jumps"]);
  });
});

describe("vec", function () {
  it("creates a new array containing the contents", function () {
    expect(fc.vec(null)).toEqual([]);

    expect(fc.vec({ a: 1, b: 2, c: 3 })).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);

    expect(fc.vec({ a: 1, b: 2, c: 3 })).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);

    expect(fc.vec(new fc.List())).toEqual([]);

    expect(fc.vec("hello")).toEqual(["h", "e", "l", "l", "o"]);

    expect(fc.vec(new Set([1, 2, 3]))).toEqual([1, 2, 3]);
  });
});

describe("vector", function () {
  it("creates a new array containing arguments given", function () {
    expect(fc.vector()).toEqual([]);
    expect(fc.vector(null)).toEqual([null]);
    expect(fc.vector(1, 2, 3)).toEqual([1, 2, 3]);
  });
});

describe("set", function () {
  it("returns a set of the distinct elements of coll", function () {
    var set1 = fc.set([1, 2, 3]);
    expect(set1.has(1)).toBe(true);
    expect(set1.has(2)).toBe(true);
    expect(set1.has(3)).toBe(true);
    expect(set1.size).toBe(3);

    var set2 = fc.set(["a", "b"]);
    expect(set2.has("a")).toBe(true);
    expect(set2.has("b")).toBe(true);
    expect(set2.size).toBe(2);
  });
});

describe("apply", function () {
  it("apply() applies fn f to the argument list formed by prepending intervening arguments to args", function () {
    expect(fc.apply(fc.str, ["str1", "str2", "str3"])).toBe("str1str2str3");
  });
});

describe("evenQmark", function () {
  it("returns true if x is even", function () {
    expect(fc.evenQmark(2)).toBe(true);
  });

  it("throws an error if x is not a number", function () {
    expect(function () {
      fc.evenQmark(null);
    }).toThrowError("Illegal argument: null is not a number");
  });
});

describe("oddQmark", function () {
  it("returns true if x is odd", function () {
    expect(fc.oddQmark(3)).toBe(true);
  });

  it("throws an error if x is not a number", function () {
    expect(function () {
      fc.oddQmark(null);
    }).toThrowError("Illegal argument: null is not a number");
  });
});

describe("complement", function () {
  it("returns the opposite truth value", function () {
    var testIsOdd = fc.complement(fc.evenQmark);
    expect(testIsOdd(3)).toBe(true);
  });
});

describe("repeat", function () {
  it("returs a lazy sequence of args", function () {
    expect([...fc.repeat(5, "x")]).toEqual(["x", "x", "x", "x", "x"]);
  });
});

describe("take", function () {
  it("returns a sequence of first n items in coll", function () {
    expect([...fc.take(3, [1, 2, 3, 4, 5, 6])]).toEqual([1, 2, 3]);

    expect([...fc.take(3, [1, 2])]).toEqual([1, 2]);

    expect([...fc.take(3, fc.drop(5, fc.range(1, 11)))]).toEqual([6, 7, 8]);
  });

  it("returns all items if there are fewer than n", function () {
    expect([...fc.take(3, [1])]).toEqual([1]);
  });

  it("returns empty collection if no items to select", function () {
    expect([...fc.take(1, [])]).toEqual([]);

    expect([...fc.take(1, null)]).toEqual([]);

    expect([...fc.take(0, [1])]).toEqual([]);

    expect([...fc.take(-1, [1])]).toEqual([]);
  });
});

describe("takeWhile", function () {
  it("returns a sequence of successive items from coll while pred(item) returns true", function () {
    expect([...fc.takeWhile(fc.negQmark, [-2, -1, 0, 1, 2, 3])]).toEqual([
      -2, -1,
    ]);

    expect([...fc.takeWhile(fc.negQmark, [-2, -1, 0, -1, -2, -3])]).toEqual([
      -2, -1,
    ]);

    expect([...fc.takeWhile(fc.negQmark, [0, 1, 2, 3])]).toEqual([]);

    expect([...fc.takeWhile(fc.negQmark, [])]).toEqual([]);

    expect([...fc.takeWhile(fc.negQmark, null)]).toEqual([]);
  });
});

describe("takeNth", function () {
  it("returns a lazy sequence of every nth item in coll", function () {
    expect([...fc.takeNth(2, fc.range(10))]).toEqual([0, 2, 4, 6, 8]);

    expect([...fc.take(3, fc.takeNth(0, fc.range(2)))]).toEqual([0, 0, 0]);

    expect([...fc.take(3, fc.takeNth(-10, fc.range(2)))]).toEqual([0, 0, 0]);
  });
});

describe("partial", function () {
  it("It returns a function that takes a variable number of additional args", function () {
    var hundredPlus = fc.partial(fc.plus, 100);
    expect(hundredPlus(5)).toBe(105);
  });
});

describe("cycle", function () {
  it("returns a sequence of repetitions from items in coll", function () {
    expect([...fc.take(5, fc.cycle(["a", "b"]))]).toEqual([
      "a",
      "b",
      "a",
      "b",
      "a",
    ]);

    expect([...fc.take(10, fc.cycle(fc.range(0, 3)))]).toEqual([
      0, 1, 2, 0, 1, 2, 0, 1, 2, 0,
    ]);
  });
});

describe("reverse", function () {
  it("reverses an array", function () {
    expect(fc.reverse([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it("works with strings", function () {
    expect(fc.reverse("hello")).toEqual(["o", "l", "l", "e", "h"]);

    expect(fc.apply(fc.str, fc.reverse("hello"))).toBe("olleh");
  });
});

describe("sort", function () {
  it("returns a sorted sequence of the items in coll", function () {
    expect(fc.sort([3, 4, 1, 2])).toEqual([1, 2, 3, 4]);
    expect(fc.sort((a, b) => b - a, [3, 4, 1, 2])).toEqual([4, 3, 2, 1]);
  });
});

describe("some", function () {
  it("returns the first true value of pred(x) for coll else null", function () {
    expect(fc.some(fc.evenQmark, [1, 2, 3, 4])).toBe(true);

    expect(fc.some(fc.evenQmark, [1, 3, 5, 7])).toBe(null);

    expect(fc.some(fc.trueQmark, [false, false, false])).toBe(null);

    expect(fc.some(fc.trueQmark, [true, true, true])).toBe(true);

    expect(fc.some((x) => x === 5, [1, 2, 3, 4, 5])).toBe(true);

    expect(fc.some((x) => x === 5, [6, 7, 8, 9, 10])).toBe(null);

    expect(fc.some((x) => x !== 5, [1, 2, 3, 4, 5])).toBe(true);

    expect(fc.some((x) => x !== 5, [6, 7, 8, 9, 10])).toBe(true);
  });
});

describe("someQmark", function () {
  it("returns true if x is not null or undefined, false otherwise", function () {
    expect(fc.someQmark(1 < 5)).toBe(true);
    expect(fc.someQmark(null)).toBe(false);
    expect(fc.someQmark(undefined)).toBe(false);
  });
});

describe("drop", function () {
  it("does nothing for negative numbers and zero", function () {
    expect([...fc.drop(-1, [1, 2, 3, 4])]).toEqual([1, 2, 3, 4]);

    expect([...fc.drop(0, [1, 2, 3, 4])]).toEqual([1, 2, 3, 4]);
  });

  it("drops the correct number of items", function () {
    expect([...fc.drop(2, [1, 2, 3, 4])]).toEqual([3, 4]);
  });

  it("returns an empty array if larger number than items given", function () {
    expect([...fc.drop(5, [1, 2, 3, 4])]).toEqual([]);
  });
});

describe("dropWhile", function () {
  it("returns a lazy sequence of the items in coll starting from the first item for which pred(value) returns false", function () {
    expect([...fc.dropWhile((x) => 3 > x, [1, 2, 3, 4, 5, 6])]).toEqual([
      3, 4, 5, 6,
    ]);

    expect([...fc.dropWhile((x) => 3 >= x, [1, 2, 3, 4, 5, 6])]).toEqual([
      4, 5, 6,
    ]);

    expect([
      ...fc.dropWhile(fc.negQmark, [-1, -2, -6, -7, 1, 2, 3, 4, -5, -6, 0, 1]),
    ]).toEqual([1, 2, 3, 4, -5, -6, 0, 1]);
  });
});

describe("distinct", function () {
  it("returns new array with duplicates removed", function () {
    expect([...fc.distinct([1, 2, 1, 3, 1, 4, 1, 5])]).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("update", function () {
  it("returns a new structure with a value updated by f", function () {
    var pet = { name: "George", age: 11 };

    expect(fc.update(pet, "age", fc.inc)).toEqual({ name: "George", age: 12 });

    expect(fc.update([1, 2, 3], 0, fc.inc)).toEqual([2, 2, 3]);

    expect(fc.update([], 0, (item) => fc.str("foo", item))).toEqual(["foo"]);
  });
});


describe("updateBang", function () {
  it("mutates existing structure with a value updated by f", function () {
    var pet = { name: "George", age: 11 };
    fc.updateBang(pet, "age", fc.inc);

    expect(pet).toEqual({ name: "George", age: 12 });
  });
});

describe("getIn", function () {
  it("returns a value from a nested structure", function () {
    var pet = {
      name: "George",
      profile: {
        name: "George V",
        address: { city: "London", street: "Tabby lane" },
      },
    };

    expect(fc.getIn(pet, ["profile", "name"])).toBe("George V");

    expect(fc.getIn(pet, ["profile", "address", "city"])).toBe("London");

    expect(fc.getIn(pet, ["profile", "address", "postcode"])).toBe(null);
  });
});

describe("updateIn", function () {
  it("updates a value in a nested structure", function () {
    var pets = [
      { name: "George", age: 11 },
      { name: "Lola", age: 10 },
    ];
    expect(fc.updateIn(pets, [1, "age"], fc.inc)).toEqual([
      { name: "George", age: 11 },
      { name: "Lola", age: 11 },
    ]);

    function charCount(s) {
      return fc.reduce(
        (m, k) => fc.updateIn(m, [k], fc.fnil(fc.inc, 0)),
        {},
        s
      );
    }

    expect(charCount("foo-bar")).toEqual({
      f: 1,
      o: 2,
      "-": 1,
      b: 1,
      a: 1,
      r: 1,
    });
  });
});

describe("fnil", function () {
  it("works with three arguments", function () {
    function sayHello(name) {
      return fc.str("Hello ", name);
    }

    var sayHelloWithDefaults = fc.fnil(sayHello, "world");

    expect(sayHelloWithDefaults(null)).toBe("Hello world");

    expect(sayHelloWithDefaults("universe")).toBe("Hello universe");
  });

  it("works with more arguments", function () {
    function sayHello2(name, world) {
      return fc.str("Hello ", name, " ", world);
    }

    var sayHelloWithDefaults2 = fc.fnil(sayHello2, "world", "planet");

    expect(sayHelloWithDefaults2("universe", null)).toBe(
      "Hello universe planet"
    );

    expect(sayHelloWithDefaults2(null, "planet")).toBe("Hello world planet");

    expect(sayHelloWithDefaults2(null, null)).toBe("Hello world planet");

    function sayHello3(name, world, wee) {
      return fc.str("Hello ", name, " ", world, " ", wee);
    }

    var sayHelloWithDefaults3 = fc.fnil(sayHello3, "world", "planet", "stars");

    expect(sayHelloWithDefaults3("universe", null, null)).toBe(
      "Hello universe planet stars"
    );

    expect(sayHelloWithDefaults3("universe", null, "hi")).toBe(
      "Hello universe planet hi"
    );

    expect(sayHelloWithDefaults3("universe", "metaverse", "hi")).toBe(
      "Hello universe metaverse hi"
    );

    expect(sayHelloWithDefaults3(null, "metaverse", null)).toBe(
      "Hello world metaverse stars"
    );
  });
});

describe("everyQmark", function () {
  it("returns true if pred(x) is true for every x in coll", function () {
    expect(fc.everyQmark(fc.evenQmark, [2, 4, 6])).toBe(true);

    expect(fc.everyQmark(fc.evenQmark, [1, 2, 3])).toBe(false);
  });
});

describe("keep", function () {
  it("returns a sequence of the non-nil results of f(item)", function () {
    expect([...fc.keep(fc.evenQmark, fc.range(1, 10))]).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ]);

    expect([
      ...fc.keep(function (x) {
        if (fc.oddQmark(x)) {
          return x;
        }
      }, fc.range(10)),
    ]).toEqual([1, 3, 5, 7, 9]);

    expect([...fc.keep(fc.seq, [fc.list(), [], ["a", "b"], null])]).toEqual([
      ["a", "b"],
    ]);
  });
});

describe("replace", function () {
  it("replaces values in a collection", function () {
    expect(
      fc.replace(["zeroth", "first", "second", "third", "fourth"], [0, 2, 4, 0])
    ).toEqual(["zeroth", "second", "fourth", "zeroth"]);

    expect(
      fc.replace(
        { 0: "ZERO", 1: "ONE", 2: "TWO" },
        fc.list("This is the code", 0, 1, 2, 0)
      )
    ).toEqual(["This is the code", "ZERO", "ONE", "TWO", "ZERO"]);

    expect(fc.replace({ 2: "a", 4: "b" }, [1, 2, 3, 4])).toEqual([
      1,
      "a",
      3,
      "b",
    ]);
  });
});

describe("emptyQmark", function () {
  it("returns true if coll has no items", function () {
    expect(fc.emptyQmark(fc.list())).toBe(true);

    expect(fc.emptyQmark(fc.list(1))).toBe(false);

    expect(
      fc.everyQmark(fc.emptyQmark, ["", [], fc.list(), {}, fc.set(), null])
    ).toBe(true);
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
