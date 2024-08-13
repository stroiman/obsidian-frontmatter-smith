import {
  ChoiceInput,
  Command,
  ConstantValue,
  ObjectInput,
  StringInput,
  ValueOption,
} from "../configuration-schema";

export const defaultConstant: ConstantValue = {
  $type: "constant" as const,
  value: "value",
};

export const defaultChoice: ChoiceInput = {
  $type: "choice-input",
  prompt: "Choice ...",
  options: [],
};

export const defaultStringInput: StringInput = {
  $type: "string-input",
  prompt: "choice ...",
};

export const defaultNumberInput: StringInput = {
  $type: "number-input",
  prompt: "choice ...",
};

export const defaultObjectInput: ObjectInput = {
  $type: "object",
  values: [],
};

export const defaultValue: ValueOption = defaultConstant;

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
