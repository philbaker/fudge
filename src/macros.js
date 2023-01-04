export function thread(operator, first, ...args) {
  let isThreadFirst;
  switch (operator) {
    case "->>":
      isThreadFirst = false;
      break;
    case "->":
      isThreadFirst = true;
      break;
    default:
      throw new Error("Operator not supported");
  }
  return args.reduce((prev, next) => {
    if (Array.isArray(next)) {
      let [head, ...tail] = next;
      return isThreadFirst
        ? head.apply(this, [prev, ...tail])
        : head.apply(this, tail.concat(prev));
    } else {
      return next.call(this, prev);
    }
  }, first);
}
// From https://medium.com/@fro_g/clojure-threading-macros-in-es6-82dc7859a82e
// thread("->", "3", parseInt);
// thread("->>", "3", parseInt);
