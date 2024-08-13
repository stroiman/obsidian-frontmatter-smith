import van, { State } from "vanjs-core";

// Silly implementation to help generate unique DOM ids, e.g. for
// <label id="input-1" /><input aria-labelledby="input-1" />.
// They don't need to be secure; just unique.
export const genId = (() => {
  let __nextId = 1;
  return (pattern?: string) =>
    `${pattern ? pattern + "-" : ""}${(++__nextId).toString()}`;
})();

export const stateArray = <T>(a: State<T[]>): State<State<T>[]> => {
  const result = van.state(a.val.map((x) => van.state(x)));
  van.derive(() => {
    const resultVal = result.val;
    if (
      resultVal !== result.oldVal ||
      resultVal.find((x) => x.val !== x.oldVal)
    ) {
      a.val = result.val.map((x) => x.val);
    }
  });
  return result;
};

type DeepState<T extends object> = {
  [P in keyof T]: State<T[P]>;
};

export const deepState = <T extends object>(x: State<T>): DeepState<T> => {
  const entries = Object.entries(x.val);
  const stateEntries = entries.map(([key, val]) => [key, van.state(val)]);
  const result = Object.fromEntries(stateEntries);
  van.derive(() => {
    const data = stateEntries.map(([key, state]: any) => {
      const val = state.val;
      return [key, val, val !== state.oldVal];
    });
    const changed = data.reduce((p, c) => p || c[2], false);
    if (changed) {
      x.val = Object.fromEntries(data);
    }
  });
  return result;
};

/**
 * This function doesn't add _anything_ functionally.
 *
 * It creates a state of a specialised type, synchronising the changes back to a
 * state of a more general type. But at runtime, the two state values are
 * identical.
 *
 * It exists _only_ to make the TypeScript code be typesafe, i.e. avoiding type
 * casts, e.g. in order to have exhaustiveness check in the compiler.
 */
export const wrapState = <T extends U, U>(
  val: T,
  state: State<U>,
): State<T> => {
  const result = van.state(val);
  van.derive(() => {
    const val = result.val;
    if (val !== result.oldVal) {
      state.val = val;
    }
  });
  return result;
};
