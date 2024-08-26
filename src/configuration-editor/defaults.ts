import {
  ChoiceValue,
  Command,
  CommandType,
  ConstantValue,
  ObjectValue,
  StringInputValue,
  Value,
} from "../smith-configuration-schema";

export const createDefaultConstantValue = (): ConstantValue => ({
  $type: "constant" as const,
  value: "value",
});

export const createDefaultChoiceValue = (): ChoiceValue => ({
  $type: "choice-input",
  prompt: "Choice ...",
  options: [],
});

export const createDefaultStringInputValue = (): StringInputValue => ({
  $type: "string-input",
  prompt: "choice ...",
});

export const createDefaultNumberInputValue = (): StringInputValue => ({
  $type: "number-input",
  prompt: "choice ...",
});

export const createDefaultObjectValue = (): ObjectValue => ({
  $type: "object",
  values: [],
});

export const createDefaultValue = (): Value => createDefaultConstantValue();

export const createAddToArrayCommand = (): Command => ({
  $command: "add-array-element",
  key: "Key",
  value: createDefaultValue(),
});

export const createDefaultSetValueCommand = (): Command => ({
  $command: "set-value",
  key: "Key",
  value: createDefaultValue(),
});

export const createDefaultCommandByType = (type: CommandType): Command => {
  switch (type) {
    case "add-array-element":
      return createAddToArrayCommand();
    case "set-value":
      return createDefaultSetValueCommand();
  }
};
