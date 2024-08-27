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

/**
 * Given a van state carrying an object, create a new object with the same keys,
 * but each value is a state object itself.
 *
 * Changes to those state objects will be propagated up to the original state.
 *
 * Note that state changes are only propagated from child to parent. We don't
 * listen for state changes coming from the caller of this function
 */
export const deepState = <T extends object>(x: State<T>): DeepState<T> => {
  // Gets the original _entries_ of the object. And entry is a 2-element array
  // in the form if [key, value]
  const entries = Object.entries(x.val);
  // For each value, create a state object of the value, resulting in a new set
  // of _entries_ for the resulting object.
  const stateEntries = entries.map(([key, val]) => [key, van.state(val)]);
  const result = Object.fromEntries(stateEntries);
  van.derive(() => {
    // Event listener for when the child states change.
    // Construct a new array, containing the entries, but with a new boolean
    // value indicating if this particular prop has changed.
    const data = stateEntries.map(([key, state]: any) => {
      const val = state.val;
      return [key, val, val !== state.oldVal /* was this value changed */];
    });
    // Finds if _any_ value was changed.
    // Why does this work?
    // `Array.prototype.find` returns the first _truthy_ element, and the
    // predicate looks up the value that tells if that particular state was
    // changed. If such a field contains `true`, that `true` value is the result
    // of `find`. If none is found, `undefined` is returned; which is `falsy`.
    // Thus this implementation will return either `true` or `undefined`, which
    // is good enough for the branch
    const changed = data.find((x) => x[2]);
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

export const deepState2way = <T extends object>(x: State<T>): DeepState<T> => {
  // Gets the original _entries_ of the object. And entry is a 2-element array
  // in the form if [key, value]
  const entries = Object.entries(x.val);
  // For each value, create a state object of the value, resulting in a new set
  // of _entries_ for the resulting object.
  const stateEntries = entries.map(([key, val]) => [key, van.state(val)]);
  const result = Object.fromEntries(stateEntries);
  van.derive(() => {
    // Propagate from parent to child
    const newParent = x.val;
    if (newParent !== x.oldVal) {
      for (const entry of Object.entries(x.val)) {
        const [key, val] = entry;
        result[key].val = val;
      }
    }
  });
  van.derive(() => {
    // Event listener for when the child states change.
    // Construct a new array, containing the entries, but with a new boolean
    // value indicating if this particular prop has changed.
    const data = stateEntries.map(([key, state]: any) => {
      const val = state.val;
      return [key, val, val !== state.oldVal /* was this value changed */];
    });
    // Finds if _any_ value was changed.
    // Why does this work?
    // `Array.prototype.find` returns the first _truthy_ element, and the
    // predicate looks up the value that tells if that particular state was
    // changed. If such a field contains `true`, that `true` value is the result
    // of `find`. If none is found, `undefined` is returned; which is `falsy`.
    // Thus this implementation will return either `true` or `undefined`, which
    // is good enough for the branch
    const changed = data.find((x) => x[2]);
    if (changed) {
      x.val = Object.fromEntries(data);
    }
  });
  return result;
};
