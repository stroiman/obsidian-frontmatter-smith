import { createForgeFromConfig, TestFileManager } from "./Forge";
import { Modals } from "./modals";
import { PluginConfiguration } from "./plugin-configuration";
import { ForgeConfiguration } from "./smith-configuration-schema";

class ForgeAPI<TFile, TFileManager extends TestFileManager<TFile>> {
  constructor(
    private deps: {
      fileManager: TFileManager;
      suggester: Modals;
      forgeConfiguration: ForgeConfiguration;
    },
  ) {}

  async runOnFile(file: TFile) {
    const forge = createForgeFromConfig(this.deps);
    await forge.run(file);
  }
}

export default class FrontmatterSmithAPI<
  TFile,
  TFileManager extends TestFileManager<TFile>,
> {
  deps: {
    fileManager: TFileManager;
    modals: Modals;
    getConfig: () => PluginConfiguration;
  };

  constructor(deps: {
    fileManager: TFileManager;
    modals: Modals;
    getConfig: () => PluginConfiguration;
  }) {
    this.deps = deps;
  }

  findForgeByName(name: string) {
    const config = this.deps.getConfig();
    const forgeConfiguration = config.smithConfiguration.forges.find(
      (x) => x.name === name,
    );
    return (
      forgeConfiguration &&
      new ForgeAPI({
        fileManager: this.deps.fileManager,
        suggester: this.deps.modals,
        forgeConfiguration,
      })
    );
  }
}
