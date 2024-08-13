import { QueryFunctions } from "./types";

export const getForgeSections = (scope: QueryFunctions) =>
  scope.queryAllByRole("region", { name: /^Forge: / });

export const getCommandSections = (scope: QueryFunctions) =>
  scope.queryAllByRole("region", { name: /^Command: / });

export const getOptions = (scope: QueryFunctions) =>
  scope.queryAllByRole("region", { name: /^Option: / });

const isVisible = (e: HTMLElement) => {
  // Not a _correct_ implementation; just checks the properties we actually use.
  return e.style.display !== "none";
};

export const getErrorMessage = (e: HTMLElement) => {
  const id = e.getAttribute("aria-errormessage");
  const elm = id ? document.getElementById(id) : null;
  if (elm && isVisible(elm)) {
    return elm.innerText;
  } else {
    return undefined;
  }
};
