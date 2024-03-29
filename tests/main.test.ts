import FrontmatterSmithPlugin from "../main";
import { expect } from "chai";
import { FrontMatter, TestFileManager, Forge } from "../src/Forge";

class MetatDataFileManager implements TestFileManager<string> {
	files: { [path: string]: FrontMatter };

	constructor() {
		this.files = {};
	}

	processFrontMatter(
		file: string,
		fn: (frontMatter: FrontMatter) => void,
	): Promise<void> {
		const current = this.files[file];
		if (!current) {
			return Promise.reject(new Error("Invalid file"));
		}
		fn(current);
		return Promise.resolve();
	}

	createFile(path: string, frontMatter: FrontMatter) {
		this.files[path] = frontMatter;
		return path;
	}

	getFrontmatter(path: string) {
		return this.files[path];
	}
}

describe("Plugin", () => {
	let fileManager: MetatDataFileManager;

	beforeEach(() => {
		fileManager = new MetatDataFileManager();
	});

	it("Should work", async () => {
		const file = fileManager.createFile("test.md", {});
		const worker = new Forge(fileManager);
		await worker.run(file);
		expect(fileManager.getFrontmatter(file)).to.deep.equal({
			foo: "bar",
		});
	});
});
