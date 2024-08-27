import sinon from "sinon";
import FrontmatterSmithAPI from "src/public-api";
import * as factories from "./configuration-factories";
import FakeMetaDataFileManager from "./fakes/FakeMetadataFileManager";
import { Modals } from "src/modals";
import { expect } from "chai";
import { PluginConfiguration } from "src/plugin-configuration";

describe("public api", () => {
  describe("Find and run forge by name", () => {
    let config: PluginConfiguration;
    let api: FrontmatterSmithAPI<string, FakeMetaDataFileManager>;
    let fileManager: FakeMetaDataFileManager;

    beforeEach(() => {
      config = factories.buildPluginConfiguration((x) =>
        x
          .addForge((f) =>
            f.setName("Forge 1").addCommand((c) =>
              c
                .setValue()
                .setKey("key-1")
                .setValue(factories.createConstantValue({ value: "value-1" })),
            ),
          )
          .addForge((f) =>
            f.setName("Forge 2").addCommand((c) =>
              c
                .setValue()
                .setKey("key-2")
                .setValue(factories.createConstantValue({ value: "value-2" })),
            ),
          ),
      );
      fileManager = new FakeMetaDataFileManager();
      const modals = sinon.createStubInstance(Modals);
      api = new FrontmatterSmithAPI({
        fileManager,
        modals,
        getConfig: () => config,
      });
    });

    it("Should run the effect of just that forge", async () => {
      const file = fileManager.createFile();
      await api.findForgeByName("Forge 1")?.runOnFile(file);
      expect(fileManager.getFrontmatter(file)).to.be.like({
        "key-1": "value-1",
      });
    });

    it("Should run the effect of just the other forge", async () => {
      const file = fileManager.createFile();
      await api.findForgeByName("Forge 2")?.runOnFile(file);
      expect(fileManager.getFrontmatter(file)).to.be.like({
        "key-2": "value-2",
      });
    });

    it("Should return undefined when searching for wrong forge name", () => {
      expect(api.findForgeByName("MISSING FORGE")).to.be.undefined;
    });
  });
});
