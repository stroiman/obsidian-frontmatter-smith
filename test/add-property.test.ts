import sinon from "sinon";
import { createOperations } from "src/ConfigurationFactory";
import { Forge } from "../src/Forge";
import * as factories from "./configuration-factories";
import FakeMetaDataFileManager from "./fakes/FakeMetadataFileManager";
import { Modals } from "src/modals";
import { expect } from "chai";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { TFile } from "./types";

describe("Add Property command", () => {
  let fileManager: FakeMetaDataFileManager;
  let modals: sinon.SinonStubbedInstance<Modals>;
  let forge: Forge<TFile, FakeMetadataFileManager>;

  beforeEach(() => {
    fileManager = new FakeMetaDataFileManager();
    modals = sinon.createStubInstance(Modals);
    forge = new Forge({
      fileManager,
      commands: createOperations([
        factories.createAddPropertyCommand({ key: "added-key" }),
      ]),
      suggester: modals,
    });
  });

  it("Creates a new empty property if none exists", async () => {
    const file = fileManager.createFile();
    await forge.run(file);
    // Null defines an "empty" property, whereas an empty string would result in
    // a string value, even if the property is defined to be a number. Later
    // entering a numeric value would result in the string representation of
    // that value, not a number value.
    expect(fileManager.getFrontmatter(file)).to.haveOwnProperty("added-key").be
      .null;
  });

  it("Leaves the property untouched if it already exists", async () => {
    const file = fileManager.createFile({
      initialFrontMatter: { "added-key": "original value" },
    });
    await forge.run(file);
    expect(fileManager.getFrontmatter(file))
      .to.haveOwnProperty("added-key")
      .equal("original value");
  });
});
