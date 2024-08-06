console.log("LOADING");

export function initialize(a, b, c) {
  console.log("INITIALIZE", a, b, c);
}

export function resolve(specifier, context, nextResolve) {
  console.log("RESOLVING", specifier, context);
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  console.log("LOAD", url, context);
  const result = await nextLoad(url, context);
  console.log("LOAD RESULT", result);
  return result;
}
