export const deepFreeze = (val: unknown) => {
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
};
