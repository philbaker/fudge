import * as c from "../core.js";

describe("concat", function () {
  it("returns a lazy sequence of concatenated elements from coll", function () {
    expect([...c.concat([1, 2], [3, 4])]).toEqual([1, 2, 3, 4]);

    expect([...c.concat(["a", "b"], null, [1, [2, 3], 4])]).toEqual([
      "a",
      "b",
      1,
      [2, 3],
      4,
    ]);

    expect([
      ...c.concat([1], [2], c.list(3, 4), [5, 6, 7], c.set([9, 10, 8])),
    ]).toEqual([1, 2, 3, 4, 5, 6, 7, 9, 10, 8]);
  });
});

describe("mapcat", function () {
  it("applies concat to the result of applying map to f and colls", function () {
    expect([
      ...c.mapcat(c.reverse, [
        [3, 2, 1, 0],
        [6, 5, 4],
        [9, 8, 7],
      ]),
    ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect([...c.mapcat(c.list, ["a", "b", "c"], [1, 2, 3])]).toEqual([
      "a",
      1,
      "b",
      2,
      "c",
      3,
    ]);

    expect([
      ...c.mapcat(function (x) {
        return [x, 2 * x];
      }, c.range(5)),
    ]).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8]);
  });
});

describe("interleave", function () {
  it("returns first item in coll, then second etc", function () {
    expect([...c.interleave(["a", "b", "c"], [1, 2, 3])]).toEqual([
      "a",
      1,
      "b",
      2,
      "c",
      3,
    ]);

    expect([...c.interleave(["a", "b", "c"], [1, 2])]).toEqual([
      "a",
      1,
      "b",
      2,
    ]);

    expect([...c.interleave(["a", "b"], [1, 2, 3])]).toEqual(["a", 1, "b", 2]);
  });
});

describe("interpose", function () {
  it("returns a lazy sequence of the elements of coll separated by sep", function () {
    expect([...c.interpose(", ", ["one", "two", "three"])]).toEqual([
      "one",
      ", ",
      "two",
      ", ",
      "three",
    ]);

    expect(c.apply(c.str, c.interpose(", ", ["one", "two", "three"]))).toBe(
      "one, two, three"
    );
  });
});

describe("selectKeys", function () {
  it("returns a map containing only those entries in the map whose key is in keys", function () {
    expect(c.selectKeys({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });

    expect(c.selectKeys({ a: 1, b: 2 }, ["a", "c"])).toEqual({ a: 1 });

    expect(c.selectKeys({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({
      a: 1,
      c: 3,
    });
  });
});

describe("partition", function () {
  it("returns a sequence of n items each at offset step apart", function () {
    expect([...c.partition(4, c.range(20))]).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [16, 17, 18, 19],
    ]);

    expect([...c.partition(4, c.range(22))]).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [16, 17, 18, 19],
    ]);

    expect([...c.partition(4, 6, c.range(20))]).toEqual([
      [0, 1, 2, 3],
      [6, 7, 8, 9],
      [12, 13, 14, 15],
    ]);

    expect([...c.partition(3, 6, ["a"], c.range(20))]).toEqual([
      [0, 1, 2],
      [6, 7, 8],
      [12, 13, 14],
      [18, 19, "a"],
    ]);

    expect([...c.partition(4, 6, ["a"], c.range(20))]).toEqual([
      [0, 1, 2, 3],
      [6, 7, 8, 9],
      [12, 13, 14, 15],
      [18, 19, "a"],
    ]);

    expect([...c.partition(4, 6, ["a", "b", "c", "d"], c.range(20))]).toEqual([
      [0, 1, 2, 3],
      [6, 7, 8, 9],
      [12, 13, 14, 15],
      [18, 19, "a", "b"],
    ]);

    expect([...c.partition(4, 3, c.range(20))]).toEqual([
      [0, 1, 2, 3],
      [3, 4, 5, 6],
      [6, 7, 8, 9],
      [9, 10, 11, 12],
      [12, 13, 14, 15],
      [15, 16, 17, 18],
    ]);

    expect([...c.partition(3, 1, ["a", "b", "c", "d", "e", "f"])]).toEqual([
      ["a", "b", "c"],
      ["b", "c", "d"],
      ["c", "d", "e"],
      ["d", "e", "f"],
    ]);
  });
});

describe("partitionAll", function () {
  it("returns a sequence of arrays like partition but may include partitions with fewer than n items at the end", function () {
    expect([...c.partitionAll(4, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])]).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9],
    ]);

    expect([...c.partitionAll(2, 4, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])]).toEqual([
      [0, 1],
      [4, 5],
      [8, 9],
    ]);

    expect([
      ...c.partitionAll(2, 3, c.list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
    ]).toEqual([[0, 1], [3, 4], [6, 7], [9]]);

    expect([
      ...c.partitionAll(3, 3, c.list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
    ]).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]);
  });
});

describe("merge", function () {
  it("returns an object that consists of the rest of the maps conjed onto the first", function () {
    expect(c.merge({ a: 1, b: 2, c: 3 }, { b: 9, d: 4 })).toEqual({
      a: 1,
      b: 9,
      c: 3,
      d: 4,
    });

    expect(c.merge({ a: 1 }, null)).toEqual({ a: 1 });

    expect(c.merge({ x: 1, y: 2 }, { y: 3, z: 4 })).toEqual({
      x: 1,
      y: 3,
      z: 4,
    });

    expect(c.merge(["a", "b"], ["c", "d"])).toEqual(["a", "b", ["c", "d"]]);

    expect(c.merge(["a", "b"], "c", "d")).toEqual(["a", "b", "c", "d"]);
  });
});

describe("seq", function () {
  it("returns null when given null", function () {
    expect(c.seq(null)).toBe(null);
  });

  it("returns same array when given an array", function () {
    expect(c.seq([1, 2])).toEqual([1, 2]);
  });

  it("returs an array of arrays when given an object", function () {
    expect(c.seq({ name: "George", occupation: "Sofa tester" })).toEqual([
      ["name", "George"],
      ["occupation", "Sofa tester"],
    ]);
  });
});

describe("cons", function () {
  it("returns x as the first item and coll as the rest", function () {
    expect([...c.cons(1, [2, 3, 4, 5, 6])]).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...c.cons([1, 2], [4, 5, 6])]).toEqual([[1, 2], 4, 5, 6]);
  });
});

describe("map", function () {
  it("applies a given function to each element of a collection", function () {
    expect([...c.map(c.inc, [1, 2, 3, 4, 5])]).toEqual([2, 3, 4, 5, 6]);

    expect([...c.map(c.last, { x: 1, y: 2, z: 3 })]).toEqual([1, 2, 3]);

    expect([
      ...c.map(function (item) {
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
    expect([...c.map(unify, months, temps)]).toEqual([
      { month: "jan", temp: 5 },
      { month: "feb", temp: 7 },
      { month: "mar", temp: 12 },
    ]);

    expect([...c.map(c.vector, [1, 2, 3, 4], ["a", "b", "c", "d"])]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
      [4, "d"],
    ]);
  });
});

describe("filter", function () {
  it("filters an array", function () {
    expect([...c.filter(c.isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]).toEqual(
      [0, 2, 4, 6, 8, 10]
    );
  });

  it("filters an object", function () {
    expect([
      ...c.filter(
        function (key, val) {
          return c.isEven(+key[0]);
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
    expect(c.filterv(c.isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual([
      0, 2, 4, 6, 8, 10,
    ]);
  });

  it("filters an object", function () {
    expect(
      c.filterv(
        function (key, val) {
          return c.isEven(+key[0]);
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
    expect([...c.remove(c.isEven, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]).toEqual(
      [1, 3, 5, 7, 9]
    );
  });

  it("filters an object", function () {
    expect([
      ...c.remove(
        function (key, val) {
          return c.isEven(+key[0]);
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
      c.mapIndexed(function (index, item) {
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

    expect(c.mapIndexed(c.vector, "foobar")).toEqual([
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
    expect(c.comp(c.isZero)(5)).toBe(false);
  });

  it("composes multiple functions", function () {
    expect(c.comp(c.str, c.plus)(8, 8, 8)).toBe("24");
  });

  it("returns its argument if one argument passed", function () {
    expect(c.comp(c.str)).toBe(c.str);
    expect(c.comp(null)).toBe(null);
  });

  it("returns the function identity if no arguments passed", function () {
    expect(c.comp()).toBe(c.identity);
  });
});

describe("rest", function () {
  it("returns all but the first element", function () {
    expect([...c.rest([1, 2, 3])]).toEqual([2, 3]);
  });

  it("returns an empty array if only one element in array", function () {
    expect([...c.rest([1])]).toEqual([]);
  });

  it("returns an empty array when given an empty array", function () {
    expect([...c.rest([])]).toEqual([]);
  });

  it("returns an empty array when given null", function () {
    expect([...c.rest(null)]).toEqual([]);
  });

  it("returns an empty array when given undefined", function () {
    expect([...c.rest(undefined)]).toEqual([]);
  });
});

describe("first", function () {
  it("returns first element in an array", function () {
    expect(c.first([1, 2, 3])).toBe(1);
  });

  it("returns first character of a string", function () {
    expect(c.first("abc")).toBe("a");
  });

  it("returns first key value pair of an object", function () {
    expect(c.first({ name: "George", weight: 100 })).toEqual([
      "name",
      "George",
    ]);
  });

  it("returns null if array is empty", function () {
    expect(c.first([])).toBe(null);
  });

  it("returns null if object is empty", function () {
    expect(c.first({})).toBe(null);
  });

  it("returns null if string is empty", function () {
    expect(c.first("")).toBe(null);
  });
});

describe("second", function () {
  it("returns second element of array", function () {
    expect(c.second([1, 2, 3])).toBe(2);
  });

  it("returns second character of string", function () {
    expect(c.second("abc")).toBe("b");
  });

  it("returns second element of array", function () {
    expect(c.second({ name: "George", weight: 100 })).toEqual(["weight", 100]);
  });

  it("returns null if array is empty", function () {
    expect(c.second([])).toBe(null);
  });

  it("returns null if second element of array does not exist", function () {
    expect(c.second([1])).toBe(null);
  });

  it("returns null if object is empty", function () {
    expect(c.second({})).toBe(null);
  });

  it("returns null if second element of object does not exist", function () {
    expect(c.second({ name: "George" })).toBe(null);
  });

  it("returns null if string is empty", function () {
    expect(c.second("")).toBe(null);
  });

  it("returns null if second character of string does not exist", function () {
    expect(c.second("a")).toBe(null);
  });
});

describe("ffirst", function () {
  it("returns the first first element", function () {
    expect(c.ffirst({ name: "George", weight: 100 })).toBe("name");
  });

  it("returns null for empty array", function () {
    expect(c.ffirst([])).toBe(null);
  });

  it("returns null for empty object", function () {
    expect(c.ffirst({})).toBe(null);
  });
});

describe("last", function () {
  it("returns the last item in an array", function () {
    expect(c.last([1, 2, 3, 4, 5])).toBe(5);
    expect(c.last(["a", "b", "c", "d", "e"])).toBe("e");
  });

  it("returns the last item in an object", function () {
    expect(c.last({ one: 1, two: 2, three: 3 })).toEqual(["three", 3]);
  });

  it("returns null if given an empty collection", function () {
    expect(c.last([])).toBe(null);
    expect(c.last({})).toBe(null);
  });
});

describe("reduced", function () {
  it("wraps x so that reduce will terminate the value with x", function () {
    expect(
      c.reduce((a, b) => {
        if (a + b > 20) {
          return c.reduced("Done early!");
        } else {
          return a + b;
        }
      }, c.range(10))
    ).toBe("Done early!");

    expect(
      c.reduce(function (a, v) {
        return c.plus(a, v);
      }, c.range(10))
    ).toBe(45);

    expect(
      c.reduce(function (a, v) {
        if (a < 100) {
          return c.plus(a, v);
        } else {
          return c.reduced("big");
        }
      }, c.range(10))
    ).toBe(45);

    expect(
      c.reduce(function (a, v) {
        if (a < 100) {
          return c.plus(a, v);
        } else {
          return c.reduced("big");
        }
      }, c.range(20))
    ).toBe("big");
  });
});

describe("reduce", function () {
  it("sums numbers in an array", function () {
    expect(c.reduce(c.plus, [1, 2, 3, 4, 5])).toBe(15);
    expect(c.reduce(c.plus, [1])).toBe(1);
    expect(c.reduce(c.plus, [1, 2])).toBe(3);
    expect(c.reduce(c.plus, 1, [])).toBe(1);
    expect(c.reduce(c.plus, 1, [2, 3])).toBe(6);
  });

  it("works with other functions", function () {
    expect(c.reduce(c.conj, [1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
    expect(c.reduce(c.str, "hello ", "world")).toBe("hello world");
  });
});

describe("reductions", function () {
  it("returns a lazy sequence of the intermediate values of the reduction", function () {
    expect([...c.reductions(c.plus, null)]).toEqual([0]);

    expect([...c.reductions(c.plus, [])]).toEqual([0]);

    expect([...c.reductions(c.plus, [1, 1, 1, 1])]).toEqual([1, 2, 3, 4]);

    expect([...c.reductions(c.plus, [1, 2, 3])]).toEqual([1, 3, 6]);

    expect([...c.reductions(c.conj, [], c.list(1, 2, 3))]).toEqual([
      [],
      [1],
      [1, 2],
      [1, 2, 3],
    ]);

    expect([...c.reductions(c.plus, [1, 2, 3, 4, 5])]).toEqual([
      1, 3, 6, 10, 15,
    ]);

    expect([...c.reductions(c.conj, [1, 2], [3, 4, 5])]).toEqual([
      [1, 2],
      [1, 2, 3],
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5],
    ]);
  });
});

describe("mutAssoc", function () {
  it("adds a value to a map via mutation", function () {
    var mapData = new Map();
    mapData.set(0, "zero");
    c.mutAssoc(mapData, 1, "one");

    expect(mapData.get(1)).toEqual("one");
    expect(mapData.size).toEqual(2);
  });

  it("adds a value to an array via mutation", function () {
    var arrData = [1, 2, 5, 6, 8, 9];
    expect(c.mutAssoc(arrData, 0, 77)).toEqual([77, 2, 5, 6, 8, 9]);
  });

  it("adds a value to an object via mutation", function () {
    var objData = { name: "George", occupation: "Sofa tester" };
    c.mutAssoc(objData, "foodPreference", "fish");
    expect(objData).toEqual({
      name: "George",
      occupation: "Sofa tester",
      foodPreference: "fish",
    });
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      c.mutAssoc("", 0, "hi");
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
    var updatedMap = c.assoc(mapData, 1, "one");
    expect(updatedMap.get(1)).toEqual("one");
    expect(updatedMap.size).toEqual(2);
  });

  it("returns a new array with modified values", function () {
    expect(c.mutAssoc([1, 2, 5, 6, 8, 9], 0, 77)).toEqual([77, 2, 5, 6, 8, 9]);
  });

  it("returns a new object with modified values", function () {
    var objData = c.assoc(
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
    expect(c.assoc(null, 0, "hi")).toEqual({ 0: "hi" });
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      c.assoc(5, 0, "hi");
    }).toThrowError(
      "Illegal argument: assoc expects a Map, Array or Object as the first argument."
    );
  });
});

describe("mutAssocIn", function () {
  it("associates a value in a nested map by mutating value", function () {
    var petsMap = new Map();
    petsMap.set(0, { name: "George", age: 12 });
    petsMap.set(1, { name: "Lola", age: 11 });
    c.mutAssocIn(petsMap, [0, "age"], 13);
    expect(petsMap.get(0).age).toEqual(13);
  });

  it("associates a value in a nested array by mutating value", function () {
    var nums = [1, 2, 3, [4, 5, 6]];

    expect(c.mutAssocIn(nums, [3, 0], 100)).toEqual([1, 2, 3, [100, 5, 6]]);
  });

  it("associates a value in a nested object by mutating value", function () {
    var pets = [
      { name: "George", age: 12 },
      { name: "Lola", age: 11 },
    ];

    c.mutAssocIn(pets, [0, "age"], 13);

    expect(pets).toEqual([
      { name: "George", age: 13 },
      { name: "Lola", age: 11 },
    ]);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      c.mutAssocIn(5, [0, "age"], 13);
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
    var newPetsMap = c.assocIn(petsMap, [0, "age"], 13);
    expect(petsMap.get(0).age).toEqual(12);
    expect(newPetsMap.get(0).age).toEqual(13);
  });

  it("associates a value in a nested array and returns a new array", function () {
    var nums = [1, 2, 3, [4, 5, 6]];
    expect(nums).toEqual([1, 2, 3, [4, 5, 6]]);
    expect(c.assocIn(nums, [3, 0], 100)).toEqual([1, 2, 3, [100, 5, 6]]);
  });

  it("associates a value in a nested object and returns a new object", function () {
    var pets = [
      { name: "George", age: 12 },
      { name: "Lola", age: 11 },
    ];
    var newPets = c.assocIn(pets, [0, "age"], 13);
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
      c.assocIn(5, [0, "age"], 13);
    }).toThrowError(
      "Illegal argument: assocIn expects a Map, Array or Object as the first argument."
    );
  });
});

describe("mutConj", function () {
  it("returns an empty array if no arguments passed", function () {
    expect(c.mutConj()).toEqual([]);
  });

  it("adds to the end of an array by mutation", function () {
    var conjArr = [1, 2, 3];
    c.mutConj(conjArr, 4);

    expect(conjArr).toEqual([1, 2, 3, 4]);
  });

  it("adds multiple items in argument order to the end of an array by mutation", function () {
    var conjArr = [1, 2];
    c.mutConj(conjArr, 3, 4);

    expect(conjArr).toEqual([1, 2, 3, 4]);
  });

  it("adds to the start of a List by mutation", function () {
    var conjList = new c.List(1, 2, 3);
    c.mutConj(conjList, 4);

    expect(conjList).toEqual([4, 1, 2, 3]);
  });

  it("adds to the end of an object by mutation", function () {
    var conjObj = { name: "George", coat: "Tabby" };
    c.mutConj(conjObj, { age: 12, nationality: "British" });

    expect(conjObj).toEqual({
      name: "George",
      coat: "Tabby",
      age: 12,
      nationality: "British",
    });
  });

  it("adds to a set by mutation", function () {
    var conjSet = new Set([1, 2, 3]);

    c.mutConj(conjSet, 4);

    expect(conjSet.has(4)).toBe(true);
  });

  it("adds to a map by mutation", function () {
    var conjMap = new Map();
    conjMap.set("name", "George");
    conjMap.set("coat", "Tabby");

    c.mutConj(conjMap, { age: 12, nationality: "British" });

    expect(conjMap.get("age")).toBe(12);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      c.mutConj(5, ["hello"]);
    }).toThrowError(
      "Illegal argument: conj! expects a Set, Array, List, Map, or Object as the first argument."
    );
  });
});

describe("conj", function () {
  it("returns an empty array if no arguments passed", function () {
    expect(c.conj()).toEqual([]);
  });

  it("adds to the end of an array", function () {
    expect(c.conj([1, 2, 3], 4)).toEqual([1, 2, 3, 4]);
  });

  it("does not mutate the original array", function () {
    var conjArr = [1, 2, 3];
    c.conj(conjArr, 4);

    expect(conjArr).toEqual([1, 2, 3]);
  });

  it("adds multiple items in argument order to the end of an array", function () {
    expect(c.conj([1, 2], 3, 4)).toEqual([1, 2, 3, 4]);
  });

  it("adds to the start of a List", function () {
    var conjList = new c.List(1, 2, 3);
    expect(c.conj(conjList, 4)).toEqual([4, 1, 2, 3]);
  });

  it("adds to the end of an object", function () {
    expect(
      c.conj(
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

    var newConjSet = c.conj(conjSet, 4);

    expect(newConjSet.has(4)).toBe(true);
  });

  it("adds to a map", function () {
    var conjMap = new Map([
      ["name", "George"],
      ["coat", "Tabby"],
    ]);

    var newConjMap = c.conj(conjMap, { age: 12, nationality: "British" });

    expect(newConjMap.get("age")).toBe(12);
  });

  it("throws an error if given incorrect type", function () {
    expect(function () {
      c.conj(5, ["hello"]);
    }).toThrowError(
      "Illegal argument: conj expects a Set, Array, List, Map, or Object as the first argument."
    );
  });
});

describe("into", function () {
  it("returns a new coll containing values from colls conjoined", function () {
    expect(c.into([], [1, 2, 3])).toEqual([1, 2, 3]);

    expect(c.into([1, 2, 3], c.list(4, 5, 6))).toEqual([1, 2, 3, 4, 5, 6]);

    expect(c.into({ x: 4 }, [{ a: 1 }, { b: 2 }, { c: 3 }])).toEqual({
      x: 4,
      a: 1,
      b: 2,
      c: 3,
    });
  });
});

describe("mutDisj", function () {
  it("removes an item from a set by mutation", function () {
    var disjSet = new Set(["a", "b", "c"]);
    c.mutDisj(disjSet, "b");

    expect(disjSet.has("b")).toBeFalse();
  });

  it("removes multiple items from set", function () {
    var disjSet = new Set(["a", "b", "c"]);
    c.mutDisj(disjSet, "a", "b");

    expect(disjSet.has("a")).toBeFalse();
    expect(disjSet.has("b")).toBeFalse();
  });
});

describe("mutDisj", function () {
  it("does not mutate the original set", function () {
    var disjSet = new Set(["a", "b", "c"]);
    var newDisjSet = c.disj(disjSet, "b");

    expect(disjSet.has("b")).toBeTrue();
    expect(newDisjSet.has("b")).toBeFalse();
  });

  it("removes multiple items from set without mutation", function () {
    var disjSet = new Set(["a", "b", "c"]);
    var newDisjSet = c.disj(disjSet, "a", "b");

    expect(disjSet.has("a")).toBeTrue();
    expect(disjSet.has("b")).toBeTrue();
    expect(newDisjSet.has("a")).toBeFalse();
    expect(newDisjSet.has("b")).toBeFalse();
  });
});

describe("itContains", function () {
  it("checks for array index as key", function () {
    expect(c.itContains([1, 2, 3], 0)).toBe(true);
    expect(c.itContains([1, 2, 3], 3)).toBe(false);
  });

  it("checks objects by key", function () {
    expect(c.itContains({ name: "George", salary: "Biscuits" }, "name")).toBe(
      true
    );
  });

  it("checks for items in a set", function () {
    expect(c.itContains(new Set(["a", "b", "c"]), "b")).toBe(true);
  });

  it("checks for items in a map", function () {
    var containsMap = new Map();
    containsMap.set("name", "George");
    containsMap.set("salary", "Biscuits");

    expect(c.itContains(containsMap, "salary")).toBe(true);
  });
});

describe("mutDissoc", function () {
  it("removes items from an object by mutation", function () {
    var dissocObj = { name: "George", salary: "Biscuits" };

    expect(c.mutDissoc(dissocObj, "name")).toEqual({ salary: "Biscuits" });
  });

  it("removes multiple items from an object", function () {
    var dissocObj = { name: "George", salary: "Biscuits" };

    expect(c.mutDissoc(dissocObj, "name", "salary")).toEqual({});
  });
});

describe("dissoc", function () {
  it("does not mutate the original object", function () {
    var dissocObj = { name: "George", salary: "Biscuits" };
    var newDissocObj = c.dissoc(dissocObj, "name");

    expect(dissocObj).toEqual({ name: "George", salary: "Biscuits" });
    expect(newDissocObj).toEqual({ salary: "Biscuits" });
  });

  it("removes multiple items from an object without mutation", function () {
    expect(
      c.dissoc({ name: "George", salary: "Biscuits" }, "name", "salary")
    ).toEqual({});
  });
});

describe("plus", function () {
  it("returns 0 if no argument provided", function () {
    expect(c.plus()).toBe(0);
  });

  it("adds two numbers", function () {
    expect(c.plus(1, 2)).toBe(3);
  });

  it("adds multiple numbers", function () {
    expect(c.plus(1, 2, 50)).toBe(53);
  });

  it("works with negative numbers", function () {
    expect(c.plus(1, -2)).toBe(-1);
  });

  it("works with decimal numbers", function () {
    expect(c.plus(1.5, 1)).toBe(2.5);
  });
});

describe("minus", function () {
  it("adds two numbers", function () {
    expect(c.minus(2, 1)).toBe(1);
  });

  it("adds multiple numbers", function () {
    expect(c.minus(5, 1, 2)).toBe(2);
  });

  it("works with negative numbers", function () {
    expect(c.minus(1, -2)).toBe(3);
  });

  it("works with decimal numbers", function () {
    expect(c.minus(1.5, 1)).toBe(0.5);
  });
});

describe("divide", function () {
  it("returns the division of numbers", function () {
    expect(c.divide(6, 3)).toBe(2);

    expect(c.divide(10)).toBe(0.1);

    expect(c.divide(6, 3, 2)).toBe(1);

    expect(c.divide(1, 3)).toBe(0.3333333333333333);

    expect(function () {
      c.divide();
    }).toThrowError("Illegal arity: 0 args passed to divide");

    expect(c.divide(1, 0)).toBe(Infinity);

    expect(c.divide(43.0, 2)).toBe(21.5);
  });
});

describe("quot", function () {
  it("returns the quotient of dividing numerator by denominator", function () {
    expect(c.quot(10, 3)).toBe(3);

    expect(c.quot(11, 3)).toBe(3);

    expect(c.quot(12, 3)).toBe(4);
  });
});

describe("multiply", function () {
  it("returns the product of numbers", function () {
    expect(c.multiply()).toBe(1);

    expect(c.multiply(6)).toBe(6);

    expect(c.multiply(2, 3)).toBe(6);

    expect(c.multiply(2, 3, 4)).toBe(24);

    expect(c.multiply(0.5, 200)).toBe(100);

    expect(c.multiply(8, 0.5)).toBe(4);
  });
});

describe("gt", function () {
  it("returns true if numbers are in decreasing order, otherwise false", function () {
    expect(c.gt(1, 2)).toBe(false);

    expect(c.gt(2, 1)).toBe(true);

    expect(c.gt(2, 2)).toBe(false);

    expect(c.gt(6, 5, 4, 3, 2)).toBe(true);

    expect(c.gt(6, 5, 4, 3, 2, 4)).toBe(false);

    expect(c.gt(6, 3, 1)).toBe(true);
  });
});

describe("lt", function () {
  it("returns true if numbers are in decreasing order, otherwise false", function () {
    expect(c.lt(1, 2)).toBe(true);

    expect(c.lt(2, 1)).toBe(false);

    expect(c.lt(2, 2)).toBe(false);

    expect(c.lt(1.5, 2)).toBe(true);

    expect(c.lt(2, 3, 4, 5, 6)).toBe(true);

    expect(c.lt(1, 0.5)).toBe(false);

    expect(c.lt(2, 3, 4, 5, 6, 1)).toBe(false);
  });
});

describe("identity", function () {
  it("returns its argument", function () {
    expect(c.identity([1])).toEqual([1]);
  });
});

describe("inc", function () {
  it("returns a number one greater than n", function () {
    expect(c.inc(5)).toBe(6);
  });
});

describe("dec", function () {
  it("returns a number one less than n", function () {
    expect(c.dec(5)).toBe(4);
  });
});

describe("nth", function () {
  it("returns value from array based on index given", function () {
    expect(c.nth(["a", "b", "c", "d"], 0)).toBe("a");
  });

  it("returns null if no element is found and no notFound argument is provided", function () {
    expect(c.nth([], 0)).toBe(null);
  });

  it("returns notFound if no element is found and notFound argument is provided", function () {
    expect(c.nth([], 0, "nothing found")).toBe("nothing found");
  });
});

describe("get", function () {
  it("returns value from array based on key provided", function () {
    expect(c.get([1, 2, 3], 1)).toBe(2);
  });

  it("returns null if key not present", function () {
    expect(c.get([1, 2, 3], 5)).toBe(null);
  });

  it("returns value from object based on key provided", function () {
    expect(c.get({ a: 1, b: 2 }, "b")).toBe(2);
  });

  it("returns notFound if key provided is not present", function () {
    expect(c.get({ a: 1, b: 2 }, "z", "missing")).toBe("missing");
  });
});

describe("str", function () {
  it("returns an empty string when no argument provided", function () {
    expect(c.str()).toBe("");
  });

  it("returns an empty string when null passed as argument", function () {
    expect(c.str(null)).toBe("");
  });

  it("converts a number into a string", function () {
    expect(c.str(1)).toBe("1");
  });

  it("concatenates multiple arguments", function () {
    expect(c.str(1, 2, 3)).toBe("123");
    expect(c.str("L", 5, "a")).toBe("L5a");
  });
});

describe("not", function () {
  it("returns true if x is logical false, false otherwise", function () {
    expect(c.not(true)).toBe(false);
    expect(c.not(false)).toBe(true);
    expect(c.not(null)).toBe(true);
    expect(c.not(undefined)).toBe(true);
    expect(c.not(1)).toBe(false);
  });
});

describe("isNil", function () {
  it("returns true if x is null, false otherwise", function () {
    expect(c.isNil(null)).toBe(true);
    expect(c.isNil(false)).toBe(false);
    expect(c.isNil(true)).toBe(false);
  });
});

describe("prStr", function () {
  it("turns a collection into a string and returns it", function () {
    expect(c.prStr([1, 2, 3, 4, 5])).toBe("[1,2,3,4,5]");

    expect(c.prStr({ name: "George", salary: "Biscuits" })).toBe(
      '{"name":"George","salary":"Biscuits"}'
    );

    var petsMap = new Map();
    petsMap.set(0, { name: "George", age: 12 });
    petsMap.set(1, { name: "Lola", age: 11 });

    expect(c.prStr(petsMap)).toBe(
      '{"0":{"name":"George","age":12},"1":{"name":"Lola","age":11}}'
    );

    expect(c.prStr(new Set([1, 2, 3]))).toBe("[1,2,3]");

    expect(c.prStr(c.cons(1, [2, 3, 4, 5, 6]))).toBe("[1,2,3,4,5,6]");
  });
});

describe("Atoms", function () {
  it("allows creation, updating and resetting of atoms", function () {
    var myAtom = c.atom(0);

    expect(myAtom.value).toBe(0);

    expect(c.mutSwap(myAtom, c.inc)).toBe(1);

    expect(
      c.mutSwap(myAtom, function (n) {
        return (n + n) * 2;
      })
    ).toBe(4);

    c.mutReset(myAtom, 0);

    expect(myAtom.value).toBe(0);
  });
});

describe("range", function () {
  it("returns an array with numbers from range specified", function () {
    expect([...c.range(10)]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect([...c.range(-5, 5)]).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]);

    expect([...c.range(-100, 100, 10)]).toEqual([
      -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50,
      60, 70, 80, 90,
    ]);

    expect([...c.range(0, 4, 2)]).toEqual([0, 2]);
  });
});

describe("reMatches", function () {
  it("returns null if no match found", function () {
    expect(c.reMatches(/hello/gi, "hello, world")).toBe(null);
  });

  it("returns a single match as a string", function () {
    expect(c.reMatches(/hello, world/gi, "hello, world")).toBe("hello, world");
    expect(c.reMatches(/hello.*/gi, "hello, world")).toBe("hello, world");
    expect(c.reMatches(/ab.*/g, "abbcdefabh")).toBe("abbcdefabh");
  });

  it("returns multiple matches in an array", function () {
    expect(
      c.reMatches(
        /quick\s(?<color>brown).+?(jumps)/dgi,
        "The Quick Brown Fox Jumps Over The Lazy Dog"
      )
    ).toEqual(["Quick Brown Fox Jumps", "Brown", "Jumps"]);
  });
});

describe("vec", function () {
  it("creates a new array containing the contents", function () {
    expect(c.vec(null)).toEqual([]);

    expect(c.vec({ a: 1, b: 2, c: 3 })).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);

    expect(c.vec({ a: 1, b: 2, c: 3 })).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);

    expect(c.vec(new c.List())).toEqual([]);

    expect(c.vec("hello")).toEqual(["h", "e", "l", "l", "o"]);

    expect(c.vec(new Set([1, 2, 3]))).toEqual([1, 2, 3]);
  });
});

describe("vector", function () {
  it("creates a new array containing arguments given", function () {
    expect(c.vector()).toEqual([]);
    expect(c.vector(null)).toEqual([null]);
    expect(c.vector(1, 2, 3)).toEqual([1, 2, 3]);
  });
});

describe("set", function () {
  it("returns a set of the distinct elements of coll", function () {
    var set1 = c.set([1, 2, 3]);
    expect(set1.has(1)).toBe(true);
    expect(set1.has(2)).toBe(true);
    expect(set1.has(3)).toBe(true);
    expect(set1.size).toBe(3);

    var set2 = c.set(["a", "b"]);
    expect(set2.has("a")).toBe(true);
    expect(set2.has("b")).toBe(true);
    expect(set2.size).toBe(2);
  });
});

describe("apply", function () {
  it("apply() applies fn f to the argument list formed by prepending intervening arguments to args", function () {
    expect(c.apply(c.str, ["str1", "str2", "str3"])).toBe("str1str2str3");
  });
});

describe("isEven", function () {
  it("returns true if x is even", function () {
    expect(c.isEven(2)).toBe(true);
  });

  it("throws an error if x is not a number", function () {
    expect(function () {
      c.isEven(null);
    }).toThrowError("Illegal argument: null is not a number");
  });
});

describe("isOdd", function () {
  it("returns true if x is odd", function () {
    expect(c.isOdd(3)).toBe(true);
  });

  it("throws an error if x is not a number", function () {
    expect(function () {
      c.isOdd(null);
    }).toThrowError("Illegal argument: null is not a number");
  });
});

describe("complement", function () {
  it("returns the opposite truth value", function () {
    var testIsOdd = c.complement(c.isEven);
    expect(testIsOdd(3)).toBe(true);
  });
});

describe("repeat", function () {
  it("returs a lazy sequence of args", function () {
    expect([...c.repeat(5, "x")]).toEqual(["x", "x", "x", "x", "x"]);
  });
});

describe("take", function () {
  it("returns a sequence of first n items in coll", function () {
    expect([...c.take(3, [1, 2, 3, 4, 5, 6])]).toEqual([1, 2, 3]);

    expect([...c.take(3, [1, 2])]).toEqual([1, 2]);

    expect([...c.take(3, c.drop(5, c.range(1, 11)))]).toEqual([6, 7, 8]);
  });

  it("returns all items if there are fewer than n", function () {
    expect([...c.take(3, [1])]).toEqual([1]);
  });

  it("returns empty collection if no items to select", function () {
    expect([...c.take(1, [])]).toEqual([]);

    expect([...c.take(1, null)]).toEqual([]);

    expect([...c.take(0, [1])]).toEqual([]);

    expect([...c.take(-1, [1])]).toEqual([]);
  });
});

describe("takeWhile", function () {
  it("returns a sequence of successive items from coll while pred(item) returns true", function () {
    expect([...c.takeWhile(c.isNeg, [-2, -1, 0, 1, 2, 3])]).toEqual([-2, -1]);

    expect([...c.takeWhile(c.isNeg, [-2, -1, 0, -1, -2, -3])]).toEqual([
      -2, -1,
    ]);

    expect([...c.takeWhile(c.isNeg, [0, 1, 2, 3])]).toEqual([]);

    expect([...c.takeWhile(c.isNeg, [])]).toEqual([]);

    expect([...c.takeWhile(c.isNeg, null)]).toEqual([]);
  });
});

describe("takeNth", function () {
  it("returns a lazy sequence of every nth item in coll", function () {
    expect([...c.takeNth(2, c.range(10))]).toEqual([0, 2, 4, 6, 8]);

    expect([...c.take(3, c.takeNth(0, c.range(2)))]).toEqual([0, 0, 0]);

    expect([...c.take(3, c.takeNth(-10, c.range(2)))]).toEqual([0, 0, 0]);
  });
});

describe("partial", function () {
  it("It returns a function that takes a variable number of additional args", function () {
    var hundredPlus = c.partial(c.plus, 100);
    expect(hundredPlus(5)).toBe(105);
  });
});

describe("cycle", function () {
  it("returns a sequence of repetitions from items in coll", function () {
    expect([...c.take(5, c.cycle(["a", "b"]))]).toEqual([
      "a",
      "b",
      "a",
      "b",
      "a",
    ]);

    expect([...c.take(10, c.cycle(c.range(0, 3)))]).toEqual([
      0, 1, 2, 0, 1, 2, 0, 1, 2, 0,
    ]);
  });
});

describe("reverse", function () {
  it("reverses an array", function () {
    expect(c.reverse([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it("works with strings", function () {
    expect(c.reverse("hello")).toEqual(["o", "l", "l", "e", "h"]);

    expect(c.apply(c.str, c.reverse("hello"))).toBe("olleh");
  });
});

describe("sort", function () {
  it("returns a sorted sequence of the items in coll", function () {
    expect(c.sort([3, 4, 1, 2])).toEqual([1, 2, 3, 4]);
    expect(c.sort((a, b) => b - a, [3, 4, 1, 2])).toEqual([4, 3, 2, 1]);
  });
});

describe("some", function () {
  it("returns the first true value of pred(x) for coll else null", function () {
    expect(c.some(c.isEven, [1, 2, 3, 4])).toBe(true);

    expect(c.some(c.isEven, [1, 3, 5, 7])).toBe(null);

    expect(c.some(c.isTrue, [false, false, false])).toBe(null);

    expect(c.some(c.isTrue, [true, true, true])).toBe(true);

    expect(c.some((x) => x === 5, [1, 2, 3, 4, 5])).toBe(true);

    expect(c.some((x) => x === 5, [6, 7, 8, 9, 10])).toBe(null);

    expect(c.some((x) => x !== 5, [1, 2, 3, 4, 5])).toBe(true);

    expect(c.some((x) => x !== 5, [6, 7, 8, 9, 10])).toBe(true);
  });
});

describe("isSome", function () {
  it("returns true if x is not null or undefined, false otherwise", function () {
    expect(c.isSome(1 < 5)).toBe(true);
    expect(c.isSome(null)).toBe(false);
    expect(c.isSome(undefined)).toBe(false);
  });
});

describe("drop", function () {
  it("does nothing for negative numbers and zero", function () {
    expect([...c.drop(-1, [1, 2, 3, 4])]).toEqual([1, 2, 3, 4]);

    expect([...c.drop(0, [1, 2, 3, 4])]).toEqual([1, 2, 3, 4]);
  });

  it("drops the correct number of items", function () {
    expect([...c.drop(2, [1, 2, 3, 4])]).toEqual([3, 4]);
  });

  it("returns an empty array if larger number than items given", function () {
    expect([...c.drop(5, [1, 2, 3, 4])]).toEqual([]);
  });
});

describe("dropWhile", function () {
  it("returns a lazy sequence of the items in coll starting from the first item for which pred(value) returns false", function () {
    expect([...c.dropWhile((x) => 3 > x, [1, 2, 3, 4, 5, 6])]).toEqual([
      3, 4, 5, 6,
    ]);

    expect([...c.dropWhile((x) => 3 >= x, [1, 2, 3, 4, 5, 6])]).toEqual([
      4, 5, 6,
    ]);

    expect([
      ...c.dropWhile(c.isNeg, [-1, -2, -6, -7, 1, 2, 3, 4, -5, -6, 0, 1]),
    ]).toEqual([1, 2, 3, 4, -5, -6, 0, 1]);
  });
});

describe("distinct", function () {
  it("returns new array with duplicates removed", function () {
    expect([...c.distinct([1, 2, 1, 3, 1, 4, 1, 5])]).toEqual([1, 2, 3, 4, 5]);

    expect([...c.distinct(["a", "a", "b", "c"])]).toEqual(["a", "b", "c"]);

    expect(c.apply(c.str, c.distinct("tattoo"))).toBe("tao");
  });
});

describe("isDistinct", function () {
  it("returns true if no two of the arguments are equal, false otherwise", function () {
    expect(c.isDistinct(1, 2, 3)).toBe(true);

    expect(c.isDistinct(1, 2, 3, 3)).toBe(false);

    expect(c.isDistinct(1, 2, 3, 3)).toBe(false);

    expect(c.isDistinct(["A", "A", "c"])).toBe(true);

    expect(c.isDistinct("A", "A", "c")).toBe(false);
  });
});

describe("update", function () {
  it("returns a new structure with a value updated by f", function () {
    var pet = { name: "George", age: 11 };

    expect(c.update(pet, "age", c.inc)).toEqual({ name: "George", age: 12 });

    expect(c.update([1, 2, 3], 0, c.inc)).toEqual([2, 2, 3]);

    expect(c.update([], 0, (item) => c.str("foo", item))).toEqual(["foo"]);
  });
});

describe("mutUpdate", function () {
  it("mutates existing structure with a value updated by f", function () {
    var pet = { name: "George", age: 11 };
    c.mutUpdate(pet, "age", c.inc);

    expect(pet).toEqual({ name: "George", age: 12 });
  });
});

describe("groupBy", function () {
  it("returns an object of the elements of coll keyed by the result of f on each element", function () {
    expect(
      c.groupBy(c.count, ["a", "as", "asd", "aa", "asdf", "qwer"])
    ).toEqual({ 1: ["a"], 2: ["as", "aa"], 3: ["asd"], 4: ["asdf", "qwer"] });

    expect(c.groupBy(c.isOdd, c.range(10))).toEqual({
      false: [0, 2, 4, 6, 8],
      true: [1, 3, 5, 7, 9],
    });
  });
});

describe("frequencies", function () {
  it("returns an object from distinct items in coll to the number of times they appear", function () {
    expect(c.frequencies(["a", "b", "a", "a"])).toEqual({ a: 3, b: 1 });
  });
});

describe("butlast", function () {
  it("returns a sequence of all but the last item in coll", function () {
    expect(c.butlast([1, 2, 3])).toEqual([1, 2]);

    expect(c.butlast(c.butlast([1, 2, 3]))).toEqual([1]);

    expect(c.butlast(c.butlast(c.butlast([1, 2, 3])))).toBe(null);
  });
});

describe("dropLast", function () {
  it("returns a lazy sequence of all but the last n items in coll", function () {
    expect([...c.dropLast([1, 2, 3, 4])]).toEqual([1, 2, 3]);

    expect([...c.dropLast(-1, [1, 2, 3, 4])]).toEqual([1, 2, 3, 4]);

    expect([...c.dropLast(0, [1, 2, 3, 4])]).toEqual([1, 2, 3, 4]);

    expect([...c.dropLast(5, [1, 2, 3, 4])]).toEqual([]);
  });
});

describe("splitAt", function () {
  it("returns an array of [take(n, coll), drop(n, coll)]", function () {
    expect(c.splitAt(2, [1, 2, 3, 4, 5])).toEqual([
      [1, 2],
      [3, 4, 5],
    ]);

    expect(c.splitAt(3, [1, 2])).toEqual([[1, 2], []]);
  });
});

describe("splitWith", function () {
  it("returns an array of [takeWhile(pred, coll), dropWhile(pred, coll)]", function () {
    expect(c.splitWith(c.isOdd, [1, 3, 5, 6, 7, 9])).toEqual([
      [1, 3, 5],
      [6, 7, 9],
    ]);
  });
});

describe("count", function () {
  it("returns the number of items in a collection", function () {
    expect(c.count(null)).toBe(0);

    expect(c.count([])).toBe(0);

    expect(c.count([1, 2, 3])).toBe(3);

    expect(c.count({ one: 1, two: 2 })).toBe(2);

    expect(c.count([1, "string", [1, 2], { foo: "bar" }])).toBe(4);

    expect(c.count("string")).toBe(6);
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

    expect(c.getIn(pet, ["profile", "name"])).toBe("George V");

    expect(c.getIn(pet, ["profile", "address", "city"])).toBe("London");

    expect(c.getIn(pet, ["profile", "address", "postcode"])).toBe(null);
  });
});

describe("updateIn", function () {
  it("updates a value in a nested structure", function () {
    var pets = [
      { name: "George", age: 11 },
      { name: "Lola", age: 10 },
    ];
    expect(c.updateIn(pets, [1, "age"], c.inc)).toEqual([
      { name: "George", age: 11 },
      { name: "Lola", age: 11 },
    ]);

    function charCount(s) {
      return c.reduce((m, k) => c.updateIn(m, [k], c.fnil(c.inc, 0)), {}, s);
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
      return c.str("Hello ", name);
    }

    var sayHelloWithDefaults = c.fnil(sayHello, "world");

    expect(sayHelloWithDefaults(null)).toBe("Hello world");

    expect(sayHelloWithDefaults("universe")).toBe("Hello universe");
  });

  it("works with more arguments", function () {
    function sayHello2(name, world) {
      return c.str("Hello ", name, " ", world);
    }

    var sayHelloWithDefaults2 = c.fnil(sayHello2, "world", "planet");

    expect(sayHelloWithDefaults2("universe", null)).toBe(
      "Hello universe planet"
    );

    expect(sayHelloWithDefaults2(null, "planet")).toBe("Hello world planet");

    expect(sayHelloWithDefaults2(null, null)).toBe("Hello world planet");

    function sayHello3(name, world, wee) {
      return c.str("Hello ", name, " ", world, " ", wee);
    }

    var sayHelloWithDefaults3 = c.fnil(sayHello3, "world", "planet", "stars");

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

describe("isEvery", function () {
  it("returns true if pred(x) is true for every x in coll", function () {
    expect(c.isEvery(c.isEven, [2, 4, 6])).toBe(true);

    expect(c.isEvery(c.isEven, [1, 2, 3])).toBe(false);
  });
});

describe("keep", function () {
  it("returns a sequence of the non-nil results of f(item)", function () {
    expect([...c.keep(c.isEven, c.range(1, 10))]).toEqual([
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
      ...c.keep(function (x) {
        if (c.isOdd(x)) {
          return x;
        }
      }, c.range(10)),
    ]).toEqual([1, 3, 5, 7, 9]);

    expect([...c.keep(c.seq, [c.list(), [], ["a", "b"], null])]).toEqual([
      ["a", "b"],
    ]);
  });
});

describe("replace", function () {
  it("replaces values in a collection", function () {
    expect(
      c.replace(["zeroth", "first", "second", "third", "fourth"], [0, 2, 4, 0])
    ).toEqual(["zeroth", "second", "fourth", "zeroth"]);

    expect(
      c.replace(
        { 0: "ZERO", 1: "ONE", 2: "TWO" },
        c.list("This is the code", 0, 1, 2, 0)
      )
    ).toEqual(["This is the code", "ZERO", "ONE", "TWO", "ZERO"]);

    expect(c.replace({ 2: "a", 4: "b" }, [1, 2, 3, 4])).toEqual([
      1,
      "a",
      3,
      "b",
    ]);
  });
});

describe("isEmpty", function () {
  it("returns true if coll has no items", function () {
    expect(c.isEmpty(c.list())).toBe(true);

    expect(c.isEmpty(c.list(1))).toBe(false);

    expect(c.isEvery(c.isEmpty, ["", [], c.list(), {}, c.set(), null])).toBe(
      true
    );
  });
});

describe("ifNot", function () {
  it("evaluates test and returns then", function () {
    expect(c.ifNot(c.isEmpty([1, 2]), c.first([1, 2]))).toBe(1);
  });

  it("returns null if test is false", function () {
    c.ifNot(c.isEmpty([]), c.first([1, 2]));
  });

  it("returns otherwise if test is false and otherwise arg provided", function () {
    expect(c.ifNot(c.isZero(0), "then", "else")).toBe("else");
  });
});

describe("cond", function () {
  it("evaluates each test one at a time returning the first true test", function () {
    function posNegOrZero(n) {
      return c.cond(
        [() => n < 0, () => "negative"],
        [() => n > 0, () => "positive"],
        [() => "else", () => "zero"]
      )();
    }

    expect(posNegOrZero(5)).toBe("positive");

    expect(posNegOrZero(-1)).toBe("negative");

    expect(posNegOrZero(0)).toBe("zero");

    function checkMark(mark) {
      return c.cond(
        [() => mark > 90, () => "A"],
        [() => mark > 80, () => "B"],
        [() => mark > 70, () => "C"],
        [() => mark > 80, () => "D"],
        [() => "else", () => "F"]
      )();
    }

    expect(checkMark(70)).toBe("F");
  });

  it("returns null if no true test", function () {
    expect(c.cond([() => false, () => "null will be returned instead"])()).toBe(
      null
    );
  });
});

describe("iff", function () {
  it("evaluates the test and returns then if true, otherwise if false", function () {
    expect(c.iff(1 > 2, "hello", "world")).toBe("world");

    expect(c.iff(3 > 2, c.str("hello", " world"), "world")).toBe("hello world");

    expect(c.iff(1 * 2 === 2, (() => 3 * 2)(), 7)).toBe(6);
  });
});

describe("tf", function () {
  it("threads x through the fns with x as the second argument", function () {
    expect(c.tf("3", parseInt)).toBe(3);
  });
});

describe("tl", function () {
  it("threads x through the fns with x as the last argument", function () {
    expect(c.tl("3", parseInt)).toBe(3);
  });
});

describe("lett", function () {
  it("groups variables in a single scope", function () {
    expect(
      c.lett(
        [
          ["x", 3],
          ["y", 4],
          ["z", 55],
        ],
        (xs) => xs.x * xs.y + xs.z
      )
    ).toBe(67);
  });
});

describe("and", function () {
  it("returns the first argument that is falsy or the last arg if all args are truthy", function () {
    expect(c.and(true, true)).toEqual(true);

    expect(c.and(true, false)).toEqual(false);

    expect(c.and([], [])).toEqual([]);

    expect(c.and({}, [])).toEqual([]);

    expect(c.and(false, null)).toEqual(false);

    expect(c.and(null, false)).toEqual(null);

    // strict equality to ensure 0 is not falsy
    expect(c.and(0, 1)).toEqual(1);

    expect(c.and(1, 0)).toEqual(0);

    expect(c.and(null, null)).toEqual(null);
  });
});

describe("or", function () {
  it("returns the first argument that is truthy or the last argument if all arguments are falsy", function () {
    expect(c.or(true, false, false)).toBe(true);

    expect(c.or(true, true, true)).toBe(true);

    expect(c.or(false, false, false)).toBe(false);

    expect(c.or(null, null)).toBe(null);

    expect(c.or(null, false)).toBe(false);

    expect(c.or(false, null)).toBe(null);

    expect(c.or(true, null)).toBe(true);

    expect(c.or(false, 42)).toBe(42);

    expect(c.or(false, 42, 9999)).toBe(42);
  });
});

describe("isInstance", function () {
  it("checks if x is an instance of c", function () {
    expect(c.isInstance(String, "hello")).toBe(true);

    expect(c.isInstance(Number, 5)).toBe(true);

    expect(c.isInstance(Number, "5")).toBe(false);

    expect(c.isInstance(Number, +"5")).toBe(true);

    expect(c.isInstance(Map, new Map())).toBe(true);

    expect(c.isInstance(Array, [])).toBe(true);

    expect(c.isInstance(Object, {})).toBe(true);

    expect(c.isInstance(c.List, c.list())).toBe(true);

    expect(c.isInstance(Set, new Set())).toBe(true);

    expect(c.isInstance(Set, function () {})).toBe(false);

    expect(c.isInstance(Function, function () {})).toBe(true);

    expect(c.isInstance(Boolean, true)).toBe(true);
  });
});

describe("keys", function () {
  it("returns all keys from an object", function () {
    expect(c.keys({ a: 1, b: 2, c: 3 })).toEqual(["a", "b", "c"]);

    expect(c.keys({})).toBe(null);

    expect(c.keys(null)).toBe(null);
  });
});

describe("vals", function () {
  it("returns all values from an object", function () {
    expect(c.vals({ a: 1, b: 2, c: 3 })).toEqual([1, 2, 3]);

    expect(c.vals({})).toBe(null);

    expect(c.vals(null)).toBe(null);
  });
});

describe("eq", function () {
  it("compares x, y and args", function () {
    expect(c.eq(5)).toBe(true);

    expect(c.eq(1, 2)).toBe(false);

    expect(c.eq(1, 1, 1)).toBe(true);

    expect(c.eq(1, 1, 2)).toBe(false);

    expect(c.eq(1, 1, 1, 1)).toBe(true);

    expect(c.eq(1, 1)).toBe(true);

    expect(c.eq(null, null)).toBe(true);

    expect(c.eq(null, null, null)).toBe(true);

    expect(c.eq(false, false)).toBe(true);

    expect(c.eq(true, true)).toBe(true);

    expect(c.eq(undefined, undefined)).toBe(true);

    expect(c.eq([1, 2], [1, 2])).toBe(true);

    expect(c.eq([1, 2], [1, 2], [1, 2])).toBe(true);

    expect(
      c.eq([1, 2, [3, 4, [{ a: "b" }]]], [1, 2, [3, 4, [{ a: "b" }]]])
    ).toBe(true);

    expect(
      c.eq(
        [1, 2, [3, 4, [{ a: "b" }]]],
        [1, 2, [3, 4, [{ a: "b" }]]],
        [1, 2, [3, 4, [{ a: "b" }]]]
      )
    ).toBe(true);

    expect(
      c.eq([1, 2, [3, 4, [{ a: "d" }]]], [1, 2, [3, 4, [{ a: "b" }]]])
    ).toBe(false);

    expect(
      c.eq(
        [1, 2, [3, 4, [{ a: "b" }]]],
        [1, 2, [3, 4, [{ a: "d" }]]],
        [1, 2, [3, 4, [{ a: "b" }]]]
      )
    ).toBe(false);

    expect(c.eq([1, 2], [1, 2, 3])).toBe(false);

    expect(c.eq({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);

    expect(c.eq({ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);

    expect(c.eq({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 })).toBe(false);

    expect(c.eq({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 }, { a: 1 })).toBe(false);

    expect(c.eq({ a: 1, b: 2 }, { a: 2, b: 1 })).toBe(false);

    expect(c.eq(c.list(1, 2, 3), [1, 2, 3])).toBe(true);

    expect(c.eq(c.list(1, 2, 3), [1, 2, 3], c.list(1, 2, 3))).toBe(true);

    expect(c.eq(c.list(1, 2, 3), c.list(1, 2, 3))).toBe(true);

    expect(c.eq(null, 1)).toBe(false);

    expect(c.eq({ a: [1, 2], b: "hello" }, { a: [1, 2], b: "hello" })).toBe(
      true
    );

    expect(
      c.eq(
        { a: [1, 2], b: "hello" },
        { a: [1, 2], b: "hello" },
        { a: [1, 2], b: "hello" }
      )
    ).toBe(true);

    expect(c.eq(c.set([1, 2, 3]), c.set([1, 2, 3]))).toBe(true);

    expect(c.eq(c.set([1, 2, 3]), c.set([1, 2, 3]), c.set([1, 2, 3]))).toBe(
      true
    );

    expect(c.eq(c.set([1, 2]), c.set([1, 2, 3]))).toBe(false);

    var eqMap = new Map();
    eqMap.set("a", 1);
    eqMap.set("b", 2);
    eqMap.set("c", 3);

    var eqMap2 = new Map();
    eqMap2.set("a", 1);
    eqMap2.set("b", 2);
    eqMap2.set("c", 3);

    var eqMap3 = new Map();
    eqMap3.set("a", 1);
    eqMap3.set("b", 2);

    expect(c.eq(eqMap, eqMap2)).toBe(true);

    expect(c.eq(eqMap, eqMap, eqMap)).toBe(true);

    expect(c.eq(eqMap, eqMap3)).toBe(false);

    expect(c.eq(5, 0)).toBe(false);
  });
});

describe("name", function () {
  it("returns the name of a symbol", function () {
    expect(c.name(c.symbol("foo"))).toBe("foo");
  });
});

describe("everyPred", function () {
  it("returns true if all predicates are true, false otherwise", function () {
    expect(c.everyPred(c.isNumber, c.isOdd)(3, 9, 1)).toBe(true);

    expect(c.everyPred(c.isNumber, c.isEven)(3, 9, 1)).toBe(false);

    expect(c.everyPred(c.isNumber, c.isOdd, c.isPos)(3, 9, 1)).toBe(true);
  });
});

describe("reSeq", function () {
  it("returns a lazy sequence of successive matches of pattern in string", function () {
    expect([...c.reSeq(/\d/g, "test 5.9.2")]).toEqual(["5", "9", "2"]);

    expect([...c.reSeq(/\w+/g, "this is the story all about how")]).toEqual([
      "this",
      "is",
      "the",
      "story",
      "all",
      "about",
      "how",
    ]);

    expect([...c.reSeq(/(\S+):(\d+)/g, " RX pkts:18 err:5 drop:48")]).toEqual([
      ["pkts:18", "pkts", "18"],
      ["err:5", "err", "5"],
      ["drop:48", "drop", "48"],
    ]);
  });
});

describe("classOf", function () {
  it("returns the class of x", function () {
    expect(c.classOf("hello")).toBe(String);

    expect(c.classOf(false)).toBe(Boolean);

    expect(c.classOf(1)).toBe(Number);

    expect(c.classOf(function () {})).toBe(Function);

    expect(c.classOf(new Map())).toBe(Map);

    expect(c.classOf([])).toBe(Array);

    expect(c.classOf({})).toBe(Object);

    expect(c.classOf(new c.List())).toBe(c.List);

    expect(c.classOf(new Set())).toBe(Set);
  });
});

describe("iterate", function () {
  it("returns a lazy sequence of x, f(x), f(f(x)) etc", function () {
    expect([...c.take(3, c.iterate(c.inc, 5))]).toEqual([5, 6, 7]);

    expect([...c.take(10, c.iterate(c.partial(c.plus, 2), 0))]).toEqual([
      0, 2, 4, 6, 8, 10, 12, 14, 16, 18,
    ]);

    expect([...c.take(20, c.iterate(c.partial(c.plus, 2), 0))]).toEqual([
      0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38,
    ]);

    var powersOfTwo = c.iterate(c.partial(c.multiply, 2), 1);

    expect(c.nth(powersOfTwo, 10)).toEqual(1024);

    expect([...c.take(10, powersOfTwo)]).toEqual([
      1, 2, 4, 8, 16, 32, 64, 128, 256, 512,
    ]);

    var fib = c.map(
      c.first,
      c.iterate(([a, b]) => [b, a + b], [0, 1])
    );

    expect([...c.take(10, fib)]).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });
});

describe("distinct", function () {
  it("returns a lazy sequence of the elements of coll with duplicates removed", function () {
    expect([...c.distinct([1, 2, 1, 3, 1, 4, 1, 5])]).toEqual([1, 2, 3, 4, 5]);

    expect([...c.distinct(["a", "a", "b", "c"])]).toEqual(["a", "b", "c"]);

    expect(c.apply(c.str, c.distinct("tattoo"))).toBe("tao");
  });
});

describe("max", function () {
  it("returns the greatest of the numbers", function () {
    expect(c.max(5, 4, 3, 2, 1)).toBe(5);

    expect(c.apply(c.max, c.list(4, 3, 5, 6, 2))).toBe(6);

    expect(c.reduce(c.max, [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3])).toBe(7);
  });
});

describe("min", function () {
  it("returns the least of the numbers", function () {
    expect(c.min(1, 2, 3, 4, 5)).toBe(1);

    expect(c.min(5, 4, 3, 2, 1)).toBe(1);

    expect(c.min(100)).toBe(100);
  });
});

describe("zipmap", function () {
  it("returns an object with keys mapped to corresponding values", function () {
    expect(c.zipmap(["a", "b", "c"], [1, 2, 3])).toEqual({ a: 1, b: 2, c: 3 });

    expect(c.zipmap(["a", "b", "c"], [1, 2])).toEqual({ a: 1, b: 2});

    expect(c.zipmap(["a", "b"], [1, 2, 3])).toEqual({ a: 1, b: 2});
  });
});
