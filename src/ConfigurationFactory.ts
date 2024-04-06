import {
  AddToArray,
  ChoiceResolver,
  ConstResolver,
  Data,
  ForgeConfiguration,
  NumberResolver,
  ObjectResolver,
  PromtResolver,
  resolveResult,
  SetValue,
  ValueResolver,
  ValueResolverResult,
} from "./ForgeConfiguration";
import { Modals } from "./modals";
import * as schema from "./configuration-schema";

class ImpossibleError extends Error {
  constructor(value: never) {
    super("Received impossible value here: " + value);
  }
}

export const getResolver = (
  option: schema.ValueOption,
): ValueResolver<Data, Modals> => {
  switch (option.$type) {
    case "number-input":
      return new NumberResolver(option);
    case "string-input":
      return new PromtResolver(option);
    case "choice-input":
      const options = option.options.map(({ commands, ...rest }) => ({
        ...rest,
        commands: createOperations(commands || []),
      }));
      return new ChoiceResolver({ ...option, options });
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

export const createOperations = (options: schema.ConfigurationOption[]) => {
  return options.map((option) => {
    switch (option.$command) {
      case "add-array-element":
        return new AddToArray(option.key, getResolver(option.value));
      case "set-value":
        return new SetValue(option.key, getResolver(option.value));
    }
  });
};

export const configurationFromJson = (
  input: schema.ConfigurationOption[],
): ForgeConfiguration => {
  return new ForgeConfiguration(createOperations(input));
};
