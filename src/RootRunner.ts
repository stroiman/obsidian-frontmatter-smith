import type { TestFileManager } from "./Forge";
import { Modals } from "./modals";
import { createForgeFromConfig } from "./Forge";
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

  async selectForge() {
    const forges = this.config.forges;
    switch (forges.length) {
      case 0:
        return null;
      case 1:
        return forges[0];
      default:
        return await this.modals.suggest(
          this.config.forges.map((x) => ({ ...x, text: x.name })),
        );
    }
  }

  async run(file: TFile) {
    const forgeConfiguration = await this.selectForge();
    if (!forgeConfiguration) {
      return;
    }
    const forge = createForgeFromConfig({
      fileManager: this.fileManager,
      forgeConfiguration,
      suggester: this.modals,
    });
    await forge.run(file);
  }
}
