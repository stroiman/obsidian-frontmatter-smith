import * as t from "io-ts";

export type ArrayConfigurationOption = {
  $command: "add-array-element";
  key: string;
  value: ValueOption;
};

type SetValueOption = {
  $command: "set-value";
  key: string;
  value: ValueOption;
};

export type ConfigurationOption = ArrayConfigurationOption | SetValueOption;

export type StringInput = {
  $value: "stringInput";
  label: string;
};

export type ChoiceInput = {
  $value: "choice";
  prompt: string;
  options: {
    text: string;
    value: string;
    commands?: ConfigurationOption[];
  }[];
};

export type ObjectValueInput = { key: string; value: ValueOption }[];

export type ObjectInput = {
  $value: "object";
  values: ObjectValueInput;
};

export type ConstantValue = {
  $value: "constant";
  value: any;
};

export type ValueOption =
  | ObjectInput
  | ChoiceInput
  | StringInput
  | ConstantValue;

const valueConfiguration: t.Type<ValueOption> = t.recursion("Value", () => {
  const stringInput = t.strict({
    $value: t.literal("stringInput"),
    label: t.string,
  });

  const constantValue = t.strict({
    $value: t.literal("constant"),
    value: t.any,
  });

  const optional = <T extends t.Any>(codec: T) => t.union([t.undefined, codec]);

  const choiceInputValue: t.Type<ChoiceInput> = t.type({
    $value: t.literal("choice"),
    prompt: t.string,
    options: t.array(
      t.type({
        text: t.string,
        value: t.string,
        commands: optional(t.array(command)),
      }),
    ),
  });

  const objectValueItem: t.Type<{ key: string; value: ValueOption }> = t.type({
    key: t.string,
    value: valueConfiguration,
  });

  const objectValue = t.type({
    $value: t.literal("object"),
    values: t.array(objectValueItem),
  });

  return t.union([objectValue, stringInput, choiceInputValue, constantValue]);
});

const command: t.Type<ConfigurationOption> = t.recursion("Command", () => {
  const addToArrayCommand = t.strict({
    $command: t.literal("add-array-element"),
    key: t.string,
    value: valueConfiguration,
  });

  const setValueCommand = t.strict({
    $command: t.literal("set-value"),
    key: t.string,
    value: valueConfiguration,
  });

  return t.union([addToArrayCommand, setValueCommand]);
});

const forgeConfiguration = t.strict({
  name: t.string,
  commands: t.array(command),
});

export const globalConfiguration = t.strict({
  version: t.literal("1"),
  forges: t.array(forgeConfiguration),
});

export type GlobalConfiguration = t.TypeOf<typeof globalConfiguration>;

export const isConfigurationValid = (x: unknown): x is GlobalConfiguration => {
  const result = globalConfiguration.decode(x);
  switch (result._tag) {
    case "Left":
      return false;
    case "Right":
      return true;
  }
  return false;
};
