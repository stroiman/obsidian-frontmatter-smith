import * as t from "io-ts";

export type ArrayConfigurationOption = {
	$command: "addToArray";
	key: string;
	element: ValueOption;
};

type SetValueOption = {
	$command: "setValue";
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

const stringInput = t.strict({
	$value: t.literal("stringInput"),
	label: t.string,
});

const constantValue = t.strict({
	$value: t.literal("constant"),
	value: t.any,
});

const optional = <T extends t.Any>(codec: T) => t.union([t.undefined, codec]);

const choiceInputValue: t.Type<ChoiceInput> = t.recursion("ChoiceInput", () =>
	t.type({
		$value: t.literal("choice"),
		prompt: t.string,
		options: t.array(
			t.type({
				text: t.string,
				value: t.string,
				commands: optional(t.array(command)),
			}),
		),
	}),
);

const objectValueItem: t.Type<{ key: string; value: ValueOption }> =
	t.recursion("ObjectValueItem", () =>
		t.type({
			key: t.string,
			value: valueConfiguration,
		}),
	);

const objectValue = t.type({
	$value: t.literal("object"),
	values: t.array(objectValueItem),
});

const valueConfiguration = t.union([
	objectValue,
	stringInput,
	choiceInputValue,
	constantValue,
]);

const addToArrayCommand = t.strict({
	$command: t.literal("addToArray"),
	key: t.string,
	element: valueConfiguration,
});

const setValueCommand = t.strict({
	$command: t.literal("setValue"),
	key: t.string,
	value: valueConfiguration,
});

const command = t.union([addToArrayCommand, setValueCommand]);

const forgeConfiguration = t.strict({
	name: t.string,
	commands: t.array(command),
});

export const globalConfiguration = t.strict({
	version: t.literal("1"),
	forges: t.array(forgeConfiguration),
});

export type GlobalConfiguration = t.TypeOf<typeof globalConfiguration>;
