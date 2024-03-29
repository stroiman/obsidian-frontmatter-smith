export type FrontMatter = { [key: string]: unknown };

export interface TestFileManager<TFile> {
	processFrontMatter(
		file: TFile,
		fn: (frontMatter: FrontMatter) => void,
	): Promise<void>;
}

export class Forge<TFile, TFileManager extends TestFileManager<TFile>> {
	fileManager: TFileManager;

	constructor(fileManager: TFileManager) {
		this.fileManager = fileManager;
	}

	async run(file: TFile) {
		this.fileManager.processFrontMatter(file, (x) => {
			x.foo = "bar";
		});
	}
}
