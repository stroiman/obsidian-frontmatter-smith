import FrontmatterSmithPlugin from "../main";
import * as sinon from "sinon";
import * as chai from "chai";
import { expect } from "chai";
import { Modals } from "../src/modals";
import { TestFileManager, Forge } from "../src/Forge";
import { randomUUID } from "crypto";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { ForgeConfiguration } from "src/ForgeConfiguration";
import { configurationFromJson } from "src/ConfigurationFactory";
import { TFile } from "./types";
import { ConfigurationOption } from "src/configuration-schema";

const { match } = sinon;

describe("'Add medicine' case", () => {
	let fileManager: FakeMetadataFileManager;
	let forge: Forge<TFile, FakeMetadataFileManager>;
	let modals: sinon.SinonStubbedInstance<Modals>;

	beforeEach(() => {
		const configuration = configurationFromJson(medConfig);

		fileManager = new FakeMetadataFileManager();
		modals = sinon.createStubInstance(Modals);
		forge = new Forge({ fileManager, configuration, suggester: modals });
		modals.suggest.selectsOption("Aspirin");
		modals.prompt.onFirstCall().resolves("500mg");
		modals.prompt.onSecondCall().resolves("12:00");
	});

	it("Should suggest the right options", async () => {
		const file = fileManager.createFile();
		await forge.run(file);
		expect(modals.suggest).to.have.been.calledWith(
			match([
				match({
					text: "Aspirin",
				}),
				match({
					text: "Paracetamol",
				}),
			]),
			"Choose type",
		);
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

	describe("File has non-array content", () => {
		it("Should leave it intact if configuration says so");
		it("Should overwrite if configuration says so");
	});
});

const medConfig: ConfigurationOption[] = [
	{
		$command: "addToArray",
		key: "medicine",
		element: {
			$value: "object",
			values: [
				{
					key: "type",
					value: {
						$value: "choice",
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
				},
				{
					key: "dose",
					value: { $value: "stringInput", label: "Dose" },
				},
				{
					key: "time",
					value: { $value: "stringInput", label: "Time" },
				},
			],
		},
	},
];
