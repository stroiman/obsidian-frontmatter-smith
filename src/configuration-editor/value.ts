import { ConstantValue, Value } from "src/smith-configuration-schema";

export const createDefaultConstantValue = (): ConstantValue => ({
  $type: "constant" as const,
  value: "value",
});

export const createDefaultValue = (): Value => createDefaultConstantValue();
