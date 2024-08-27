import {
  ChoiceValue,
  ChoiceValueItem,
  Command,
  CommandType,
  ConstantValue,
  ForgeConfiguration,
  createId,
  ObjectValue,
  ObjectValueItem,
  StringInputValue,
  Value,
} from "../smith-configuration-schema";

export const createDefaultObjectValueItem = (): ObjectValueItem => ({
  $id: createId(),
  key: "key ...",
  value: createDefaultValue(),
});

export const createDefaultChoiceValueItem = (): ChoiceValueItem => ({
  $id: createId(),
  text: "Value ...",
  value: "Value ...",
  commands: [],
});

export const createDefaultForgeConfiguration = (): ForgeConfiguration => ({
  $id: createId(),
  name: "Forge name ...",
  commands: [createDefaultSetValueCommand()],
});

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
  $id: createId(),
  $command: "add-array-element",
  key: "Key",
  value: createDefaultValue(),
});

export const createDefaultSetValueCommand = (): Command => ({
  $id: createId(),
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
