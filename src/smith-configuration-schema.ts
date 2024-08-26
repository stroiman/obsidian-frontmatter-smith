import * as t from "io-ts";
import { withFallback } from "io-ts-types";

export type AddToArrayCommand = {
  $command: "add-array-element";
  key: string;
  value: Value;
};

export type SetValueCommand = {
  $command: "set-value";
  key: string;
  value: Value;
};

export type Command = AddToArrayCommand | SetValueCommand;

export type StringInputValue = {
  $type: "string-input" | "number-input";
  prompt: string;
};

export type ChoiceValueItem = {
  text: string;
  value: string;
  commands: Command[];
};

export type ChoiceValue = {
  $type: "choice-input";
  prompt: string;
  options: ChoiceValueItem[];
};

export type ObjectValueItem = { key: string; value: Value };

export type ObjectValue = {
  $type: "object";
  values: ObjectValueItem[];
};

export type ConstantValue = {
  $type: "constant";
  value: any;
};

export type Value =
  | ObjectValue
  | ChoiceValue
  | StringInputValue
  | ConstantValue;

export type ValueType = Value["$type"];

const value: t.Type<Value> = t.recursion("Value", () => {
  const stringInput = t.strict({
    $type: t.union([t.literal("string-input"), t.literal("number-input")]),
    prompt: t.string,
  });

  const constantValue = t.strict({
    $type: t.literal("constant"),
    value: t.any,
  });

  const choiceValue: t.Type<ChoiceValue> = t.type({
    $type: t.literal("choice-input"),
    prompt: t.string,
    options: t.array(
      t.type({
        text: t.string,
        value: t.string,
        commands: withFallback(t.array(command), []),
      }),
    ),
  });

  const objectValueItem: t.Type<{ key: string; value: Value }> = t.type({
    key: t.string,
    value: value,
  });

  const objectValue = t.type({
    $type: t.literal("object"),
    values: t.array(objectValueItem),
  });

  return t.union([objectValue, stringInput, choiceValue, constantValue]);
});

const command: t.Type<Command> = t.recursion("Command", () => {
  const addToArrayCommand = t.strict({
    $command: t.literal("add-array-element"),
    key: t.string,
    value: value,
  });

  const setValueCommand = t.strict({
    $command: t.literal("set-value"),
    key: t.string,
    value: value,
  });

  return t.union([addToArrayCommand, setValueCommand]);
});

const forgeConfiguration = t.strict({
  name: t.string,
  commands: t.array(command),
});

export type ForgeConfiguration = t.TypeOf<typeof forgeConfiguration>;
export type Commands = ForgeConfiguration["commands"];
export type CommandType = Command["$command"];

export const smithConfiguration = t.strict({
  version: t.literal("1"),
  forges: t.array(forgeConfiguration),
});

export type SmithConfiguration = t.TypeOf<typeof smithConfiguration>;

export const emptySmithConfiguration: SmithConfiguration = {
  version: "1",
  forges: [],
};

export const isConfigurationValid = (x: unknown): x is SmithConfiguration => {
  const result = smithConfiguration.decode(x);
  switch (result._tag) {
    case "Left":
      return false;
    case "Right":
      return true;
  }
  return false;
};

export const parseConfiguration = (x: unknown): SmithConfiguration | null => {
  const result = smithConfiguration.decode(x);
  switch (result._tag) {
    case "Left":
      console.error("Error parsing plugin config", result.left);
      return null;
    case "Right":
      return result.right;
  }
  throw new Error("Not supposed to be here!");
};

export const parseConfigOrDefault = (x: unknown): SmithConfiguration => {
  return parseConfiguration(x) || emptySmithConfiguration;
};
