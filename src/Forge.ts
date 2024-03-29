import { Modals } from "./modals";

export type FrontMatter = { [key: string]: unknown };

export interface TestFileManager<TFile> {
	processFrontMatter(
		file: TFile,
		fn: (frontMatter: FrontMatter) => void,
	): Promise<void>;
}

type MetadataOperation = (input: FrontMatter) => void;

const addToArrayOperation = (input: {
	key: string;
	value: Data;
}): MetadataOperation => {
	return (metadata) => {
		const existing = metadata[input.key];
		const medicine = Array.isArray(existing) ? existing : [];
		metadata.medicine = [...(medicine || []), input.value];
	};
};

type Data = string | null | { [key: string]: Data };

const getValue = async (option: ValueOption, modals: Modals): Promise<Data> => {
	switch (option.$value) {
		case "stringInput":
			return await modals.prompt({
				label: option.prompt,
			});
		case "choice":
			return modals
				.suggest(option.options, option.prompt)
				.then((x) => x?.value || null);
		case "object":
			return await option.values.reduce(async (prev, curr): Promise<Data> => {
				const prevValue = await prev;
				const value = await getValue(curr.value, modals);
				if (!value) {
					return prevValue;
				}
				return {
					...prevValue,
					[curr.key]: value,
				};
			}, Promise.resolve({}));
	}
};

const getOperations = async (input: {
	configuration: ForgeConfiguration;
	suggester: Modals;
}) => {
	const result = await input.configuration
		.getOptions()
		.reduce(async (prev, curr): Promise<MetadataOperation[]> => {
			return prev.then(async (x) => {
				switch (curr.$type) {
					case "addToArray":
						const value = await getValue(curr.element, input.suggester);
						if (!value) {
							return x;
						}
						return [
							...x,
							addToArrayOperation({
								key: curr.key,
								value,
							}),
						];
				}
			});
		}, Promise.resolve([]));
	return result;
};

export class Forge<TFile, TFileManager extends TestFileManager<TFile>> {
	fileManager: TFileManager;
	suggester: Modals;
	configuration: ForgeConfiguration;

	constructor(deps: {
		fileManager: TFileManager;
		configuration: ForgeConfiguration;
		suggester: Modals;
	}) {
		this.fileManager = deps.fileManager;
		this.configuration = deps.configuration;
		this.suggester = deps.suggester;
	}

	async run(file: TFile) {
		const operations = await getOperations(this);
		this.fileManager.processFrontMatter(file, (metadata) => {
			operations.forEach((x) => x(metadata));
		});
	}
}

type ArrayConfigurationOption = {
	$type: "addToArray";
	key: string;
	element: ValueOption;
};

type StringInput = {
	$value: "stringInput";
	prompt: string;
};

type ChoiceInput = {
	$value: "choice";
	prompt: string;
	options: {
		text: string;
		value: string;
	}[];
};

type ObjectInput = {
	$value: "object";
	values: { key: string; value: ValueOption }[];
};

type ValueOption = ObjectInput | ChoiceInput | StringInput;

type ConfigurationOption = ArrayConfigurationOption;

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
							value: { $value: "stringInput", prompt: "Dose" },
						},
						{
							key: "time",
							value: { $value: "stringInput", prompt: "Time" },
						},
					],
				},
			},
		];
	}
}
