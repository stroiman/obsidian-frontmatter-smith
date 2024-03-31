import {
	ChoiceInput,
	Data,
	ForgeConfiguration,
	FrontMatter,
	MetadataOperation,
	ObjectValueInput,
	ValueOption,
	ValueResolverResult,
} from "./ForgeConfiguration";
import { Modals } from "./modals";

export interface TestFileManager<TFile> {
	processFrontMatter(
		file: TFile,
		fn: (frontMatter: FrontMatter) => void,
	): Promise<void>;
}

const asArrayOrEmpty = (input: unknown) => (Array.isArray(input) ? input : []);

const addToArrayOperation = (input: {
	key: string;
	value: Data;
}): MetadataOperation => {
	return (metadata) => {
		metadata[input.key] = [...asArrayOrEmpty(metadata[input.key]), input.value];
	};
};

const getOperations = async (input: {
	configuration: ForgeConfiguration;
	suggester: Modals;
}): Promise<MetadataOperation[]> => {
	const ops = input.configuration.getOptions();
	const x = await ops.reduce(async (prevP, curr) => {
		const prev = await prevP;
		const newElement = await curr.run(input.suggester);
		return [...prev, newElement];
		return prev;
	}, Promise.resolve([]));

	return x.flat();
};

type Operation = (deps: Modals) => Promise<MetadataOperation[]>;

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
