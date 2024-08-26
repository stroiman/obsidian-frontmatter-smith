import {
  SetValueCommand,
  StringInputValue,
} from "src/smith-configuration-schema";

export const createStringInput = (
  input?: Partial<StringInputValue>,
): StringInputValue => {
  return { $type: "string-input", prompt: "Type something", ...input };
};

export const createSetValueCommand = (
  input?: Partial<SetValueCommand>,
): SetValueCommand => {
  return {
    $command: "set-value",
    key: "type",
    value: createStringInput(),
    ...input,
  };
};
