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
	suggester: modals.Suggester;
}) => {
	const items = [
		{
			text: "Aspirin",
			value: "[[Aspirin]]",
		},
		{
			text: "Paracetamol",
			value: "[[Paracetamol]]",
		},
	];
	const option = await input.suggester.suggest(items, (x) => x.text);
	if (!option) {
		return [];
	}
	return [
		addToArrayOperation({
			key: "medicine",
			value: {
				type: option.value,
				dose: "500mg",
				time: "12:00",
			},
		}),
	];
};

export class Forge<TFile, TFileManager extends TestFileManager<TFile>> {
	fileManager: TFileManager;
	suggester: modals.Suggester;
	configuration: ForgeConfiguration;

	constructor(deps: {
		fileManager: TFileManager;
		configuration: ForgeConfiguration;
		suggester: modals.Suggester;
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

export class ForgeConfiguration {}
