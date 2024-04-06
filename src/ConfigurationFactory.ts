import {
	AddToArray,
	ChoiceResolver,
	ConstResolver,
	Data,
	ForgeConfiguration,
	ObjectResolver,
	PromtResolver,
	resolveResult,
	SetValue,
	ValueResolver,
	ValueResolverResult,
} from "./ForgeConfiguration";
import { Modals } from "./modals";

export type ArrayConfigurationOption = {
	$type: "addToArray";
	key: string;
	element: ValueOption;
};

type SetValueOption = {
	$type: "setValue";
	key: string;
	value: ValueOption;
};

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
	value: Data;
};

export type ValueOption =
	| ObjectInput
	| ChoiceInput
	| StringInput
	| ConstantValue;

export type ConfigurationOption = ArrayConfigurationOption | SetValueOption;

export type MoldConfiguration = {
	name: string;
	configuration: ConfigurationOption;
};

export type GlobalConfiguration = {
	version: "1";
	molds: MoldConfiguration[];
};

class ImpossibleError extends Error {
	constructor(value: never) {
		super("Received impossible value here: " + value);
	}
}

const getResolver = (option: ValueOption): ValueResolver<Data, Modals> => {
	switch (option.$value) {
		case "stringInput":
			return new PromtResolver(option);
		case "choice":
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

export const createOperations = (options: ConfigurationOption[]) => {
	return options.map((option) => {
		switch (option.$type) {
			case "addToArray":
				return new AddToArray(option.key, getResolver(option.element));
			case "setValue":
				return new SetValue(option.key, getResolver(option.value));
		}
	});
};

export const configurationFromJson = (
	input: ConfigurationOption[],
): ForgeConfiguration => {
	return new ForgeConfiguration(createOperations(input));
};
