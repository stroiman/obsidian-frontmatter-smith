import FrontmatterSmithPlugin from "../main";
import { expect } from "chai";
import { FrontMatter, TestFileManager, Forge } from "../src/Forge";
import { randomUUID } from "crypto";

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

	createFile(input?: { path?: string; initialFrontMatter?: FrontMatter }) {
		const path = input?.path || `${randomUUID()}.md`;
		this.files[path] = input?.initialFrontMatter || {};
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
		const file = fileManager.createFile();
		const worker = new Forge(fileManager);
		await worker.run(file);
		expect(fileManager.getFrontmatter(file)).to.deep.equal({
			foo: "bar",
		});
	});
});
