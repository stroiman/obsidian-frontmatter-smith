import {
  ChoiceValue,
  Command,
  ConstantValue,
  ObjectValue,
  StringInputValue,
  Value,
} from "../smith-configuration-schema";

export const defaultConstant: ConstantValue = {
  $type: "constant" as const,
  value: "value",
};

export const defaultChoice: ChoiceValue = {
  $type: "choice-input",
  prompt: "Choice ...",
  options: [],
};

export const defaultStringInput: StringInputValue = {
  $type: "string-input",
  prompt: "choice ...",
};

export const defaultNumberInput: StringInputValue = {
  $type: "number-input",
  prompt: "choice ...",
};

export const defaultObjectInput: ObjectValue = {
  $type: "object",
  values: [],
};

export const defaultValue: Value = defaultConstant;

export const defaultAddToArrayCommand: Command = {
  $command: "add-array-element",
  key: "Key",
  value: defaultValue,
};

export const defaultSetValueCommand: Command = {
  $command: "set-value",
  key: "Key",
  value: defaultValue,
};

export const defaultCommandByType: Record<Command["$command"], Command> = {
  [defaultAddToArrayCommand.$command]: defaultAddToArrayCommand,
  [defaultSetValueCommand.$command]: defaultSetValueCommand,
};

export const defaultCommand = defaultSetValueCommand;
