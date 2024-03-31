import { Modals } from "./modals";

export type FrontMatter = { [key: string]: unknown };

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

export type Data = string | null | { [key: string]: Data };
export type ValueResolverResult<T> = { value: T };

export interface ValueResolver<T, TDeps> {
	run(): (deps: TDeps) => Promise<ValueResolverResult<T>>;
}

const resolveResult = {
	ret: <T>(value: T): ValueResolverResult<T> => ({ value }),
};

type Prompt = Pick<Modals, "prompt">;
type Suggest = Pick<Modals, "suggest">;

export class PromtResolver implements ValueResolver<string | null, Prompt> {
	constructor(private options: { label: string }) {}

	run() {
		return (deps: Prompt) => {
			return deps.prompt(this.options).then((x) => resolveResult.ret(x));
		};
	}
}

export class ChoiceResolver implements ValueResolver<string | null, Suggest> {
	constructor(private options: ChoiceInput) {}

	run() {
		return (deps: Suggest) => {
			return deps
				.suggest(this.options.options, this.options.prompt)
				.then((x) => resolveResult.ret(x?.value || null));
		};
	}
}

export class ObjectResolver implements ValueResolver<Data, Modals> {
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

export type MetadataOperation = (input: FrontMatter) => void;

interface MetadataCommand<TDeps> {
	run(deps: TDeps): Promise<MetadataOperation[]>;
}

export class AddToArray<TDeps> implements MetadataCommand<TDeps> {
	constructor(
		private key: string,
		private option: ValueResolver<Data, TDeps>,
	) {}

	async run(deps: TDeps): Promise<MetadataOperation[]> {
		const { value } = await this.option.run()(deps);
		if (!value) {
			return [];
		}
		return [
			(metadata) => {
				const existing = metadata[this.key];
				const medicine = Array.isArray(existing) ? existing : [];
				metadata[this.key] = [...(medicine || []), value];
			},
		];
	}
}

export class ForgeConfiguration {
	constructor(private commands: MetadataCommand<Modals>[]) {}

	getOptions() {
		return this.commands;
	}
}
