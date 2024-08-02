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
  $type: "string-input" | "number-input";
  prompt: string;
};

export type ChoiceInput = {
  $type: "choice-input";
  prompt: string;
  options: {
    text: string;
    value: string;
    commands?: ConfigurationOption[];
  }[];
};

export type ObjectValueInput = { key: string; value: ValueOption }[];

export type ObjectInput = {
  $type: "object";
  values: ObjectValueInput;
};

export type ConstantValue = {
  $type: "constant";
  value: any;
};

export type ValueOption =
  | ObjectInput
  | ChoiceInput
  | StringInput
  | ConstantValue;

const valueConfiguration: t.Type<ValueOption> = t.recursion("Value", () => {
  const stringInput = t.strict({
    $type: t.union([t.literal("string-input"), t.literal("number-input")]),
    prompt: t.string,
  });

  const constantValue = t.strict({
    $type: t.literal("constant"),
    value: t.any,
  });

  const optional = <T extends t.Any>(codec: T) => t.union([t.undefined, codec]);

  const choiceInputValue: t.Type<ChoiceInput> = t.type({
    $type: t.literal("choice-input"),
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
    $type: t.literal("object"),
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

export type ForgeConfiguration = t.TypeOf<typeof forgeConfiguration>;

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
