import * as sinon from "sinon";
import { expect } from "chai";
import { Modals } from "../src/modals";
import { TestFileManager, Forge } from "../src/Forge";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { configurationFromJson, getResolver } from "src/ConfigurationFactory";
import { Command } from "src/smith-configuration-schema";

const { match } = sinon;

type GetTFile<T extends TestFileManager<any>> =
  T extends TestFileManager<infer U> ? U : never;

type TFile = GetTFile<FakeMetadataFileManager>;

describe("'Add value' case", () => {
  let fileManager: FakeMetadataFileManager;
  let forge: Forge<TFile, FakeMetadataFileManager>;
  let modals: sinon.SinonStubbedInstance<Modals>;

  beforeEach(() => {
    const configuration = configurationFromJson(config);
    fileManager = new FakeMetadataFileManager();
    modals = sinon.createStubInstance(Modals);
    forge = new Forge({ fileManager, configuration, suggester: modals });
    modals.prompt.onFirstCall().resolves("Value");
  });

  it("Should suggest the right options", async () => {
    const file = fileManager.createFile();
    await forge.run(file);
    expect(modals.prompt).to.have.been.calledOnceWith(
      match({ prompt: "Type something" }),
    );
  });

  it("Should set the selected value", async () => {
    const file = fileManager.createFile();
    await forge.run(file);
    expect(fileManager.getFrontmatter(file)).to.deep.equal({
      type: "Value",
    });
  });

  describe("File has metadata already", () => {
    it("Should leave it intact if configuration says so");
    it("Should overwrite if configuration says so");
  });
});

describe("number-input values", () => {
  it("Should return a number, if the user typed a number", async () => {
    const modals = sinon.createStubInstance(Modals);
    modals.prompt.resolves("42");
    const resolver = getResolver({
      $type: "number-input",
      prompt: "Type a value",
    });
    const result = await resolver.run(modals);
    expect(result.value).to.equal(42);
  });
});

const config: Command[] = [
  {
    $command: "set-value",
    key: "type",
    value: { $type: "string-input", prompt: "Type something" },
  },
];
