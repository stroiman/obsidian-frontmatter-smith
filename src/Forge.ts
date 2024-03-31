import {
	ChoiceInput,
	choiceValueResolver,
	Data,
	ForgeConfiguration,
	getValue,
	ObjectValueInput,
	stringValueResulter,
	ValueOption,
	ValueResolverResult,
} from "./ForgeConfiguration";
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
