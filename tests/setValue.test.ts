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
import { ConfigurationOption } from "src/configuration-schema";

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

  it("Should add a 'medicine' entry if none exists", async () => {
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

const config: ConfigurationOption[] = [
  {
    $command: "set-value",
    key: "type",
    value: { $type: "string-input", prompt: "Type something" },
  },
];
