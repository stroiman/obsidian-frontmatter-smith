import { ValueOption } from "../configuration-schema";

export const defaultValue: ValueOption = {
  $type: "constant" as const,
  value: "value",
};
