import {
  AddToArray,
  ChoiceResolver,
  ConstResolver,
  Data,
  NumberResolver,
  ObjectResolver,
  PromtResolver,
  SetValue,
  AddProperty,
} from "./ForgeConfiguration";
import { ValueResolver } from "./metadata-command";
import { Modals } from "./modals";
import * as schema from "./smith-configuration-schema";

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

export const createOperations = (options: schema.Command[]) => {
  return options.map((option) => {
    switch (option.$command) {
      case "add-array-element":
        return new AddToArray(option.key, getResolver(option.value));
      case "set-value":
        return new SetValue(option.key, getResolver(option.value));
      case "add-property":
        return new AddProperty(option.key);
    }
  });
};
