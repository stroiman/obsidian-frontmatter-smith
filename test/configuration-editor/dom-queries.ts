import { QueryFunctions } from "./types";

export const getForgeSections = (scope: QueryFunctions) =>
  scope.queryAllByRole("region", { name: /^Forge: / });
