import { AddProperty } from "./commands/add-property";
import { AddToArray } from "./commands/add-to-array";
import { Data } from "./ForgeConfiguration";
import { ValueResolver } from "./metadata-command";
import { Modals } from "./modals";
import {
  ChoiceResolver,
  ConstResolver,
  NumberResolver,
  ObjectResolver,
  PromtResolver,
} from "./resolvers";
import { CommandTypeSetTag, SetTag } from "./commands/set-tag";
import { SetValue } from "./commands/set-value";
import * as schema from "./smith-configuration-schema";
import { Command } from "./commands";

export const getResolver = (
  option: schema.Value,
): ValueResolver<Data, Modals> => {
  switch (option.$type) {
    case "number-input":
      return new NumberResolver(option);
    case "string-input":
      return new PromtResolver(option);
    case "choice-input": {
      const options = option.options.map(({ commands, ...rest }) => ({
        ...rest,
        commands: createOperations(commands || []),
      }));
      return new ChoiceResolver({ ...option, options });
    }
    case "object":
      return new ObjectResolver(
        option.values.map(({ key, value }) => ({
          key,
          resolver: getResolver(value),
        })),
      );
    case "constant":
      return new ConstResolver(option.value);
  }
};

export const createOperations = (commands: Command[]) => {
  return commands.map((cmd) => {
    switch (cmd.$command) {
      case "add-array-element":
        return new AddToArray(cmd.key, getResolver(cmd.value));
      case "set-value":
        return new SetValue(cmd.key, getResolver(cmd.value));
      case "add-property":
        return new AddProperty(cmd.key);
      case CommandTypeSetTag:
        return new SetTag(cmd.tag);
    }
  });
};
