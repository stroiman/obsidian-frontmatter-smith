import {
  AddPropertyCommand,
  addPropertyConfig,
  CommandTypeAddProperty,
} from "./add-property";
import {
  addArrayElementConfig,
  AddToArrayCommand,
  CommandTypeAddToArray,
} from "./add-to-array";
import { CommandTypeSetTag, SetTagCommand, setTagConfig } from "./set-tag";
import {
  CommandTypeSetValue,
  SetValueCommand,
  setValueConfig,
} from "./set-value";

export type Command =
  | AddPropertyCommand
  | AddToArrayCommand
  | SetValueCommand
  | SetTagCommand;

export type CommandType = Command["$command"];
export type CommandOf<T extends CommandType> = Command & { $command: T };
export type GetCommand<T extends CommandType> =
  CommandOf<T> extends infer U ? U : never;

type Map = {
  [key in CommandType]: {
    createDefault: () => GetCommand<key>;
  };
};

export const commands: Map = {
  [CommandTypeSetValue]: setValueConfig,
  [CommandTypeAddToArray]: addArrayElementConfig,
  [CommandTypeAddProperty]: addPropertyConfig,
  [CommandTypeSetTag]: setTagConfig,
};
