import { expect } from "chai";
import * as sinon from "sinon";
import { TFile } from "./types";
import {
	configurationFromJson,
	ConfigurationOption,
	GlobalConfiguration,
	MoldConfiguration,
} from "src/ConfigurationFactory";
import { Modals } from "src/modals";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import RootRunner from "src/RootRunner";

describe("Choosing a mold", () => {
	let fileManager: FakeMetadataFileManager;
	let modals: sinon.SinonStubbedInstance<Modals>;
	let rootRunnerToBeRenamed: RootRunner<TFile, FakeMetadataFileManager>;

	beforeEach(() => {
		modals = sinon.createStubInstance(Modals);
		fileManager = new FakeMetadataFileManager();
	});

	describe("Config has two molds", () => {
		beforeEach(() => {
			rootRunnerToBeRenamed = new RootRunner(config, fileManager, modals);
		});

		it("Should query the user", async () => {
			// Test explicitly what is implicitly tested, as both options are covered
			modals.suggest.selectsOption("Add foo");
			const file = fileManager.createFile();
			await rootRunnerToBeRenamed.run(file);
			expect(modals.suggest).to.have.been.calledOnce;
		});

		it("Should add a Foo when that is selected", async () => {
			modals.suggest.selectsOption("Add foo");
			const file = fileManager.createFile();
			await rootRunnerToBeRenamed.run(file);

			expect(fileManager.getFrontmatter(file)).to.deep.equal({
				foo: "foo value",
			});
		});

		it("Should add a Bar when that is selected", async () => {
			modals.suggest.selectsOption("Add bar");
			const file = fileManager.createFile();
			await rootRunnerToBeRenamed.run(file);

			expect(fileManager.getFrontmatter(file)).to.deep.equal({
				bar: "bar value",
			});
		});
	});

	describe("Config has two molds", () => {
		it("Should set the right option without UI input", async () => {
			const file = fileManager.createFile();
			const rootRunner = new RootRunner(singleMoldConfig, fileManager, modals);
			await rootRunner.run(file);

			expect(fileManager.getFrontmatter(file)).to.deep.equal({
				foo: "foo value",
			});
			expect(modals.suggest).to.not.have.been.called;
		});
	});
});

const addFoo: ConfigurationOption = {
	$type: "setValue",
	key: "foo",
	value: { $value: "constant", value: "foo value" },
};
const addBar: ConfigurationOption = {
	$type: "setValue",
	key: "bar",
	value: { $value: "constant", value: "bar value" },
};

const config: GlobalConfiguration = {
	version: "1",
	molds: [
		{
			name: "Add foo",
			configurations: [addFoo],
		},
		{ name: "Add bar", configurations: [addBar] },
	],
};

const singleMoldConfig: GlobalConfiguration = {
	version: "1",
	molds: [
		{
			name: "Add foo",
			configurations: [addFoo],
		},
	],
};
