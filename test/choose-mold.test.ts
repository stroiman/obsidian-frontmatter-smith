import { expect } from "chai";
import * as sinon from "sinon";
import { TFile } from "./types";
import { Modals } from "src/modals";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";
import RootRunner from "src/RootRunner";
import {
  SmithConfiguration,
  isConfigurationValid,
} from "src/smith-configuration-schema";
import {
  buildSmithConfiguration,
  createConstantValue,
} from "./configuration-factories";

describe("Choosing a mold", () => {
  let fileManager: FakeMetadataFileManager;
  let modals: sinon.SinonStubbedInstance<Modals>;
  let rootRunnerToBeRenamed: RootRunner<TFile, FakeMetadataFileManager>;

  beforeEach(() => {
    modals = sinon.createStubInstance(Modals);
    fileManager = new FakeMetadataFileManager();
  });

  it("Validates the configuration", () => {
    expect(isConfigurationValid(config)).to.be.true;
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

const config: SmithConfiguration = buildSmithConfiguration((s) =>
  s
    .addForge((f) =>
      f.setName("Add foo").addCommand((c) =>
        c
          .setValue()
          .setKey("foo")
          .setValue(createConstantValue({ value: "foo value" })),
      ),
    )
    .addForge((f) =>
      f.setName("Add bar").addCommand((c) =>
        c
          .setValue()
          .setKey("bar")
          .setValue(createConstantValue({ value: "bar value" })),
      ),
    ),
);

const singleMoldConfig: SmithConfiguration = buildSmithConfiguration((s) =>
  s.addForge((f) =>
    f.setName("Add foo").addCommand((c) =>
      c
        .setValue()
        .setKey("foo")
        .setValue(createConstantValue({ value: "foo value" })),
    ),
  ),
);
