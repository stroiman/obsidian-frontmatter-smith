import {
	configurationFromJson,
	GlobalConfiguration,
} from "./ConfigurationFactory";
import type { TestFileManager } from "./Forge";
import { Modals } from "./modals";
import { Forge } from "./Forge";

export default class RootRunner<
	TFile,
	TFileManager extends TestFileManager<TFile>,
> {
	constructor(
		private config: GlobalConfiguration,
		private fileManager: TFileManager,
		private modals: Modals,
	) {}

	async run(file: TFile) {
		const molds = this.config.molds;
		if (!molds.length) {
			return;
		}

		const mold =
			molds.length === 1
				? molds[0]
				: await this.modals.suggest(
						this.config.molds.map((x) => ({ ...x, text: x.name })),
					);
		if (!mold) {
			return;
		}
		const forge = new Forge({
			fileManager: this.fileManager,
			configuration: configurationFromJson(mold.configurations),
			suggester: this.modals,
		});
		await forge.run(file);
	}
}
