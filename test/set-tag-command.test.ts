import sinon from "sinon";
import { createOperations } from "src/ConfigurationFactory";
import { Forge } from "../src/Forge";
import * as factories from "./configuration-factories";
import FakeMetaDataFileManager from "./fakes/FakeMetadataFileManager";
import { Modals } from "src/modals";
import { expect } from "chai";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { TFile } from "./types";

describe("SetTag", () => {
  let fileManager: FakeMetaDataFileManager;
  let modals: sinon.SinonStubbedInstance<Modals>;
  let forge: Forge<TFile, FakeMetadataFileManager>;

  beforeEach(() => {
    fileManager = new FakeMetaDataFileManager();
    modals = sinon.createStubInstance(Modals);
    forge = new Forge({
      fileManager,
      commands: createOperations([
        factories.createSetTagCommand({ tag: "foo/bar" }),
      ]),
      suggester: modals,
    });
  });

  it("Adds the tag if no tags exists", async () => {
    const file = fileManager.createFile();
    await forge.run(file);
    // Null defines an "empty" property, whereas an empty string would result in
    // a string value, even if the property is defined to be a number. Later
    // entering a numeric value would result in the string representation of
    // that value, not a number value.
    expect(fileManager.getFrontmatter(file))
      .to.haveOwnProperty("tags")
      .deep.equal(["foo/bar"]);
  });

  it("Adds the tag if it has some tags", async () => {
    const file = fileManager.createFile({
      initialFrontMatter: { tags: ["foo", "foo/baz", "baz"] },
    });
    await forge.run(file);
    // Null defines an "empty" property, whereas an empty string would result in
    // a string value, even if the property is defined to be a number. Later
    // entering a numeric value would result in the string representation of
    // that value, not a number value.
    expect(fileManager.getFrontmatter(file))
      .to.haveOwnProperty("tags")
      .deep.equal(["baz", "foo", "foo/bar", "foo/baz"]);
  });

  it("Leaves the property untouched if tag already exists", async () => {
    const file = fileManager.createFile({
      initialFrontMatter: { tags: ["foo", "foo/bar"] },
    });
    await forge.run(file);
    expect(fileManager.getFrontmatter(file))
      .to.haveOwnProperty("tags")
      .deep.equal(["foo", "foo/bar"]);
  });
});
