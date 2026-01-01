import * as sinon from "sinon";
import { expect } from "chai";
import { Modals } from "../src/modals";
import { Forge } from "../src/Forge";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import { createOperations } from "src/ConfigurationFactory";
import { TFile } from "./types";
import * as factories from "./configuration-factories";
import { Command } from "src/commands";

const { match } = sinon;

describe("'Add medicine' case", () => {
  let fileManager: FakeMetadataFileManager;
  let forge: Forge<TFile, FakeMetadataFileManager>;
  let modals: sinon.SinonStubbedInstance<Modals>;

  beforeEach(() => {
    fileManager = new FakeMetadataFileManager();
    modals = sinon.createStubInstance(Modals);
    forge = new Forge({
      fileManager,
      commands: createOperations(medConfig),
      suggester: modals,
    });
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

  it("Should use the right prompt", async () => {
    const file = fileManager.createFile();
    await forge.run(file);
    expect(modals.prompt).to.have.been.calledWith(match({ prompt: "Dose" }));
    expect(modals.prompt).to.have.been.calledWith(match({ prompt: "Time" }));
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

const medConfig: Command[] = [
  factories.createAddToArrayCommand({
    key: "medicine",
    value: factories
      .buildObjectValue()
      .addItem((x) =>
        x
          .setKey("type")
          .setValueF((x) =>
            x
              .choiceValue()
              .setPrompt("Choose type")
              .addItem("Aspirin", "[[Aspirin]]")
              .addItem("Paracetamol", "[[Paracetamol]]"),
          ),
      )
      .addItem((x) =>
        x.setKey("dose").setValueF((y) => y.stringInputWithPrompt("Dose")),
      )
      .addItem((x) =>
        x.setKey("time").setValueF((y) => y.stringInputWithPrompt("Time")),
      )
      .build(),
  }),
];
