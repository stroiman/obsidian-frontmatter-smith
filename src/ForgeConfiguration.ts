import { Modals } from "./modals";

export type ArrayConfigurationOption = {
	$type: "addToArray";
	key: string;
	element: ValueOption;
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

export type ConfigurationOption = ArrayConfigurationOption;

export class ForgeConfiguration {
	getOptions(): ConfigurationOption[] {
		return [
			{
				$type: "addToArray",
				key: "medicine",
				element: {
					$value: "object",
					values: [
						{
							key: "type",
							value: {
								$value: "choice",
								prompt: "Choose type",
								options: [
									{
										text: "Aspirin",
										value: "[[Aspirin]]",
									},
									{
										text: "Paracetamol",
										value: "[[Paracetamol]]",
									},
								],
							},
						},
						{
							key: "dose",
							value: { $value: "stringInput", label: "Dose" },
						},
						{
							key: "time",
							value: { $value: "stringInput", label: "Time" },
						},
					],
				},
			},
		];
	}
}

export type Data = string | null | { [key: string]: Data };
export type ValueResolverResult<T> = { value: T };

interface ValueResolver<T, TDeps> {
	run(): (deps: TDeps) => Promise<ValueResolverResult<T>>;
}

const resolveResult = {
	ret: <T>(value: T): ValueResolverResult<T> => ({ value }),
};

type Prompt = Pick<Modals, "prompt">;
type Suggest = Pick<Modals, "suggest">;

class PromtResolver implements ValueResolver<string | null, Prompt> {
	constructor(private options: { label: string }) {}

	run() {
		return (deps: Prompt) => {
			return deps.prompt(this.options).then((x) => resolveResult.ret(x));
		};
	}
}

class ChoiceResolver implements ValueResolver<string | null, Suggest> {
	constructor(private options: ChoiceInput) {}

	run() {
		return (deps: Suggest) => {
			return deps
				.suggest(this.options.options, this.options.prompt)
				.then((x) => resolveResult.ret(x?.value || null));
		};
	}
}

class ObjectResolver implements ValueResolver<Data, Modals> {
	constructor(
		private options: { key: string; resolver: ValueResolver<Data, Modals> }[],
	) {}

	run() {
		return (deps: Modals) => {
			return this.options
				.reduce(async (prev, curr): Promise<Data> => {
					const prevValue = await prev;
					const { value } = await curr.resolver.run()(deps);
					if (!value) {
						return prevValue;
					}
					return {
						...prevValue,
						[curr.key]: value,
					};
				}, Promise.resolve({}))
				.then(resolveResult.ret);
		};
	}
}

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

export const getValue = async (
	option: ValueOption,
	modals: Modals,
): Promise<Data> => {
	return getResolver(option)
		.run()(modals)
		.then(({ value }) => value);
};
