import { configurationFromJson } from "./ConfigurationFactory";
import type { TestFileManager } from "./Forge";
import { Modals } from "./modals";
import { Forge } from "./Forge";
import { SmithConfiguration } from "./smith-configuration-schema";

export default class RootRunner<
  TFile,
  TFileManager extends TestFileManager<TFile>,
> {
  constructor(
    private config: SmithConfiguration,
    private fileManager: TFileManager,
    private modals: Modals,
  ) {}

  async run(file: TFile) {
    const forges = this.config.forges;
    if (!forges.length) {
      return;
    }
    const forgeConfiguration =
      forges.length === 1
        ? forges[0]
        : await this.modals.suggest(
            this.config.forges.map((x) => ({ ...x, text: x.name })),
          );
    if (!forgeConfiguration) {
      return;
    }
    const forge = new Forge({
      fileManager: this.fileManager,
      configuration: configurationFromJson(forgeConfiguration.commands),
      suggester: this.modals,
    });
    await forge.run(file);
  }
}
