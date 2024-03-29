import FrontmatterSmithPlugin from "../main";
import { expect } from "chai";
import { FrontMatter, TestFileManager, Forge } from "../src/Forge";
import { randomUUID } from "crypto";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";

type GetTFile<T extends TestFileManager<any>> =
	T extends TestFileManager<infer U> ? U : never;

type TFile = GetTFile<FakeMetadataFileManager>;

describe("'Add medicine' case", () => {
	let fileManager: FakeMetadataFileManager;
	let forge: Forge<TFile, FakeMetadataFileManager>;
	let file: TFile;

	beforeEach(() => {
		fileManager = new FakeMetadataFileManager();
		forge = new Forge(fileManager);
		file = fileManager.createFile();
	});

	it("Should work", async () => {
		await forge.run(file);
		expect(fileManager.getFrontmatter(file)).to.deep.equal({
			foo: "bar",
		});
	});
});
