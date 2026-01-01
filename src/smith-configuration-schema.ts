import * as t from "io-ts";
import reporter from "io-ts-reporters";
import { withFallback } from "io-ts-types";
import { withValidate } from "io-ts-types";
import { orElse } from "fp-ts/lib/Either";
import { nanoid } from "nanoid";
import { AddPropertyCommand } from "./add-property";
import { SetValueCommand } from "./set-value";
import { SetTagCommand } from "./set-tag-command";
import { AddToArrayCommand } from "./add-to-array";

const withFallbackFn = <C extends t.Any>(
  codec: C,
  a: () => t.TypeOf<C>,
  name = `withFallback(${codec.name})`,
): C => {
  return withValidate(
    codec,
    (u, c) => orElse(() => t.success(a()))(codec.validate(u, c)),
    name,
  );
};

export const createId = nanoid;

const $id = withFallbackFn(t.string, createId);

export type Command =
  | AddPropertyCommand
  | AddToArrayCommand
  | SetValueCommand
  | SetTagCommand;

export type StringInputValue = {
  $type: "string-input" | "number-input";
  prompt: string;
};

export type ChoiceValueItem = {
  $id: string;
  text: string;
  value: string;
  commands: Command[];
};

export type ChoiceValue = {
  $type: "choice-input";
  prompt: string;
  options: ChoiceValueItem[];
};

export type ObjectValueItem = { $id: string; key: string; value: Value };

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

  const choiceValueItem = t.type({
    $id,
    text: t.string,
    value: t.string,
    commands: withFallback(t.array(command), []),
  });

  const choiceValue: t.Type<ChoiceValue> = t.type({
    $type: t.literal("choice-input"),
    prompt: t.string,
    options: t.array(choiceValueItem),
  });

  const objectValueItem: t.Type<ObjectValueItem> = t.type({
    $id,
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
    $id,
    $command: t.literal("add-array-element"),
    key: t.string,
    value: value,
  });

  const setValueCommand = t.strict({
    $id,
    $command: t.literal("set-value"),
    key: t.string,
    value: value,
  });

  return t.union([addToArrayCommand, setValueCommand]);
});

const forgeConfiguration = t.strict({
  $id,
  name: t.string,
  commands: t.array(command),
});

export type ForgeConfiguration = t.TypeOf<typeof forgeConfiguration>;
export type Commands = ForgeConfiguration["commands"];

export type CommandType = Command["$command"];
export type CommandOf<T extends CommandType> = Command & { $command: T };

export type GetCommand<T extends CommandType> =
  CommandOf<T> extends infer U ? U : never;

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
      console.error("Error parsing plugin config", reporter.report(result));
      return null;
    case "Right":
      return result.right;
  }
  throw new Error("Not supposed to be here!");
};

export const parseConfigOrDefault = (x: unknown): SmithConfiguration => {
  return parseConfiguration(x) || emptySmithConfiguration;
};
