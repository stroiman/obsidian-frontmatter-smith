import {
	AddToArray,
	ChoiceResolver,
	Data,
	ForgeConfiguration,
	ObjectResolver,
	PromtResolver,
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
	}[];
};

export type ObjectValueInput = { key: string; value: ValueOption }[];

export type ObjectInput = {
	$value: "object";
	values: ObjectValueInput;
};

export type ValueOption = ObjectInput | ChoiceInput | StringInput;

export type ConfigurationOption = ArrayConfigurationOption | SetValueOption;

const getResolver = (option: ValueOption): ValueResolver<Data, Modals> => {
	switch (option.$value) {
		case "stringInput":
			return new PromtResolver(option);
		case "choice":
			return new ChoiceResolver(option);
		case "object":
			return new ObjectResolver(
				option.values.map(({ key, value }) => ({
					key,
					resolver: getResolver(value),
				})),
			);
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
