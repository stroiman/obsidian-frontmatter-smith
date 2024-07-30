import * as sinon from "sinon";
import { expect } from "chai";
import { Modals } from "../src/modals";
import { Forge } from "../src/Forge";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { configurationFromJson } from "src/ConfigurationFactory";
import { TFile } from "./types";
import { ConfigurationOption } from "src/configuration-schema";

describe("'dependent choices' case", () => {
  let fileManager: FakeMetadataFileManager;
  let forge: Forge<TFile, FakeMetadataFileManager>;
  let modals: sinon.SinonStubbedInstance<Modals>;

  beforeEach(() => {
    const configuration = configurationFromJson(medConfig);
    fileManager = new FakeMetadataFileManager();
    modals = sinon.createStubInstance(Modals);
    forge = new Forge({ fileManager, configuration, suggester: modals });
    modals.prompt.onFirstCall().resolves("Foo");
  });

  it("Should not add subtype if selecting first option", async () => {
    const file = fileManager.createFile();
    modals.suggest.selectsOption("Choice 1");
    await forge.run(file);
    expect(fileManager.getFrontmatter(file)).to.deep.equal({
      type: "[[Choice 1]]",
    });
  });

  it("Should add subtype if selecting second option", async () => {
    const file = fileManager.createFile();
    modals.suggest.selectsOption("Choice 2");
    await forge.run(file);
    expect(fileManager.getFrontmatter(file)).to.deep.equal({
      type: "[[Choice 2]]",
      "sub-type": "Foo",
    });
  });
});

const medConfig: ConfigurationOption[] = [
  {
    $command: "set-value",
    key: "type",
    value: {
      $type: "choice-input",
      prompt: "Choose type",
      options: [
        {
          text: "Choice 1",
          value: "[[Choice 1]]",
        },
        {
          text: "Choice 2",
          value: "[[Choice 2]]",
          commands: [
            {
              $command: "set-value",
              key: "sub-type",
              value: { $type: "string-input", prompt: "Type something" },
            },
          ],
        },
      ],
    },
  },
];
