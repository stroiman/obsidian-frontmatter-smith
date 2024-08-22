export const deepFreeze = <T>(val: T): T => {
  if (val) {
    switch (typeof val) {
      case "object":
        for (const v of Object.values(val)) {
          deepFreeze(v);
        }
      case "function": // eslint-disable-line
        Object.freeze(val);
        break;
      default:
        break;
    }
  }
  return val;
};
