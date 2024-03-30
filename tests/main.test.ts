import FrontmatterSmithPlugin from "../main";
import * as sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
import { expect } from "chai";
import { Modals } from "../src/modals";
import { FrontMatter, TestFileManager, Forge } from "../src/Forge";
import { randomUUID } from "crypto";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { ForgeConfiguration } from "src/ForgeConfiguration";

const { match } = sinon;

sinon.addBehavior("selectsOption", function (fake, value) {
	fake.callsFake((items: { text: string }[]) => {
		const item = items.find((x) => x.text === value);
		if (!item) {
			throw new Error("Issue in test, item not selectable");
		}
		return Promise.resolve(item);
	});
});

declare module "sinon" {
	// eslint-disable-next-line
	interface SinonStub<TArgs, TReturnValue> {
		selectsOption: (x: string) => void;
	}
}

chai.use(sinonChai);

type GetTFile<T extends TestFileManager<any>> =
	T extends TestFileManager<infer U> ? U : never;

type TFile = GetTFile<FakeMetadataFileManager>;

describe("'Add medicine' case", () => {
	let fileManager: FakeMetadataFileManager;
	let forge: Forge<TFile, FakeMetadataFileManager>;
	let modals: sinon.SinonStubbedInstance<Modals>;

	beforeEach(() => {
		const configuration = new ForgeConfiguration();
		fileManager = new FakeMetadataFileManager();
		modals = sinon.createStubInstance(Modals);
		forge = new Forge({ fileManager, configuration, suggester: modals });
		modals.suggest.selectsOption("Aspirin");
		modals.prompt.onFirstCall().resolves("500mg");
		modals.prompt.onSecondCall().resolves("12:00");
	});

	afterEach(() => {
		sinon.reset();
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
