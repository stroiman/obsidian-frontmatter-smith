import * as modals from "./modals";

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
	value: object;
}): MetadataOperation => {
	return (metadata) => {
		const existing = metadata[input.key];
		const medicine = Array.isArray(existing) ? existing : [];
		metadata.medicine = [...(medicine || []), input.value];
	};
};

const getOperations = async (input: {
	configuration: ForgeConfiguration;
	suggester: modals.Modals;
}) => {
	const result = await input.configuration
		.getOptions()
		.reduce(async (prev, curr): Promise<MetadataOperation[]> => {
			return prev.then(async (x) => {
				const value = await curr.values.reduce(async (prev, curr) => {
					const prevValue = await prev;
					const value = curr.options
						? (await input.suggester.suggest(curr.options, "Choose type"))
								?.value
						: await input.suggester.prompt({
								label: curr.prompt,
							});
					if (!value) {
						return prevValue;
					}
					return {
						...prevValue,
						[curr.key]: value,
					};
				}, Promise.resolve({}));
				return [
					...x,
					addToArrayOperation({
						key: curr.key,
						value,
					}),
				];
			});
		}, Promise.resolve([]));
	return result;
};

export class Forge<TFile, TFileManager extends TestFileManager<TFile>> {
	fileManager: TFileManager;
	suggester: modals.Modals;
	configuration: ForgeConfiguration;

	constructor(deps: {
		fileManager: TFileManager;
		configuration: ForgeConfiguration;
		suggester: modals.Modals;
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

export class ForgeConfiguration {
	getOptions() {
		return [
			{
				key: "medicine",
				values: [
					{
						key: "type",
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
					{
						key: "dose",
						prompt: "Dose",
					},
					{
						key: "time",
						prompt: "Time",
					},
				],
			},
		];
	}
}
