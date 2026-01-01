import { createDefaultAddPropertyCommand } from "src/add-property";
import {
  ChoiceValue,
  ChoiceValueItem,
  Command,
  CommandType,
  ForgeConfiguration,
  createId,
  ObjectValue,
  ObjectValueItem,
  StringInputValue,
  GetCommand,
  AddToArrayCommand,
} from "../smith-configuration-schema";
import { createDefaultValue } from "./value";
import { createDefaultSetValueCommand } from "src/set-value";

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

export const createAddToArrayCommand = (): AddToArrayCommand => ({
  $id: createId(),
  $command: "add-array-element" as const,
  key: "Key",
  value: createDefaultValue(),
});

export const createDefaultCommand = createAddToArrayCommand;

export const migrateCommandToType = (
  command: Command,
  type: CommandType,
): Command => {
  const res = createDefaultCommandByType(type);
  if ("key" in command && "key" in res) {
    res.key = command.key;
  }
  if ("value" in command && "value" in res) {
    res.value = command.value;
  }
  return res;
};

export const createDefaultCommandByType = <T extends CommandType>(
  type: T,
): GetCommand<T> => {
  // TODO: Figure out why the type cast is necessary
  switch (type) {
    case "add-array-element":
      return createAddToArrayCommand() as GetCommand<T>;
    case "set-value":
      return createDefaultSetValueCommand() as GetCommand<T>;
    case "add-property":
      return createDefaultAddPropertyCommand() as GetCommand<T>;
    default:
      throw new Error("Impossible value");
  }
};
