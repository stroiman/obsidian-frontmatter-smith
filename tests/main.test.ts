import FrontmatterSmithPlugin from "../main";
import { expect } from "chai";
import {
	FrontMatter,
	TestFileManager,
	Forge,
	ForgeConfiguration,
} from "../src/Forge";
import { randomUUID } from "crypto";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";

type GetTFile<T extends TestFileManager<any>> =
	T extends TestFileManager<infer U> ? U : never;

type TFile = GetTFile<FakeMetadataFileManager>;

describe("'Add medicine' case", () => {
	let fileManager: FakeMetadataFileManager;
	let forge: Forge<TFile, FakeMetadataFileManager>;

	beforeEach(() => {
		const configuration = new ForgeConfiguration();
		fileManager = new FakeMetadataFileManager();
		forge = new Forge(fileManager, configuration);
	});

	it("Should add a 'medicine' entry if none exists", async () => {
		const file = fileManager.createFile();
		await forge.run(file);
		expect(fileManager.getFrontmatter(file)).to.deep.equal({
			medicine: [
				{
					type: "[[Aspirin]]",
					dose: "500mg",
					time: "12:00",
				},
			],
		});
	});

	it("Should add a new object to existing 'medicine' entry if it exists", async () => {
		const file = fileManager.createFile({
			initialFrontMatter: {
				medicine: [
					{
						type: "[[Paracetamol]]",
						dose: "1000mg",
						time: "08:00",
					},
				],
			},
		});
		await forge.run(file);
		expect(fileManager.getFrontmatter(file)).to.deep.equal({
			medicine: [
				{
					type: "[[Paracetamol]]",
					dose: "1000mg",
					time: "08:00",
				},
				{
					type: "[[Aspirin]]",
					dose: "500mg",
					time: "12:00",
				},
			],
		});
	});
});
