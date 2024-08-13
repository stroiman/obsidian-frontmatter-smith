import {
  ChoiceInput,
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
