import * as sinon from "sinon";
import { expect } from "chai";
import { Modals } from "../src/modals";
import { createForgeFromConfig, Forge } from "../src/Forge";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { TFile } from "./types";
import { Command } from "src/smith-configuration-schema";
import * as factories from "./configuration-factories";

describe("'dependent choices' case", () => {
  let fileManager: FakeMetadataFileManager;
  let forge: Forge<TFile, FakeMetadataFileManager>;
  let suggester: sinon.SinonStubbedInstance<Modals>;

  beforeEach(() => {
    const forgeConfiguration = { commands: medConfig };
    fileManager = new FakeMetadataFileManager();
    suggester = sinon.createStubInstance(Modals);
    forge = createForgeFromConfig({
      fileManager,
      forgeConfiguration,
      suggester,
    });
    suggester.prompt.onFirstCall().resolves("Foo");
  });

  it("Should not add subtype if selecting first option", async () => {
    const file = fileManager.createFile();
    suggester.suggest.selectsOption("Choice 1");
    await forge.run(file);
    expect(fileManager.getFrontmatter(file)).to.deep.equal({
      type: "[[Choice 1]]",
    });
  });

  it("Should add subtype if selecting second option", async () => {
    const file = fileManager.createFile();
    suggester.suggest.selectsOption("Choice 2");
    await forge.run(file);
    expect(fileManager.getFrontmatter(file)).to.deep.equal({
      type: "[[Choice 2]]",
      "sub-type": "Foo",
    });
  });
});

const medConfig: Command[] = [
  factories.createSetValueCommand({
    value: factories
      .buildValue()
      .addItem("Choice 1", "[[Choice 1]]")
      .addItem((x) =>
        x
          .setText("Choice 2")
          .setValue("[[Choice 2]]")
          .addSetValueCommand((x) => x.setKey("sub-type")),
      )
      .build(),
  }),
];
