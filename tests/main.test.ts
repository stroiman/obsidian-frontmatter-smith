import FrontmatterSmithPlugin from "../main";
import { expect } from "chai";
import { FrontMatter, TestFileManager, Forge } from "../src/Forge";
import { randomUUID } from "crypto";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";

describe("Plugin", () => {
	let fileManager: FakeMetadataFileManager;

	beforeEach(() => {
		fileManager = new FakeMetadataFileManager();
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
