import { createDefaultAddPropertyCommand } from "src/commands/add-property";
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
} from "../smith-configuration-schema";
import { createDefaultValue } from "./value";
import { createDefaultSetValueCommand } from "src/commands/set-value";
import { createDefaultSetTagCommand } from "src/commands/set-tag";
import { createDefaultAddToArrayCommand } from "src/commands/add-to-array";

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

export const createDefaultCommand = createDefaultAddToArrayCommand;

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
      return createDefaultAddToArrayCommand() as GetCommand<T>;
    case "set-value":
      return createDefaultSetValueCommand() as GetCommand<T>;
    case "add-property":
      return createDefaultAddPropertyCommand() as GetCommand<T>;
    case "set-tag":
      return createDefaultSetTagCommand() as GetCommand<T>;
    default:
      throw new Error("Impossible value");
  }
};
