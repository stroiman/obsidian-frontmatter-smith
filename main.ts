import { Editor, MarkdownView, Plugin, PluginManifest, App } from "obsidian";
import { FuzzySuggester } from "src/FuzzySuggester";
import { ObsidianPromptModal } from "src/ObsidianPromptModal";
import { Modals } from "src/modals";
import { Forge } from "./src/Forge";
import { ForgeConfiguration } from "./src/ForgeConfiguration";
import SettingTab from "./PluginSettings";

interface PluginConstructor {
	new (app: App, manifest: PluginManifest): Plugin;
}

module Obsidian {
	declare var Plugin: PluginConstructor;
}

const createPluginClass = (baseClass: PluginConstructor) => {
	return class MyPlugin extends baseClass {
		async onload() {
			console.log("Loaded my plugin");
			const handleSettingChange = (newValue: string) => {};

			this.addSettingTab(new SettingTab(this.app, this, handleSettingChange));

			this.addCommand({
				id: "forge-frontmatter",
				name: "Forge frontmatter",
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					const file = view.file;
					if (file) {
						const worker = new Forge({
							fileManager: this.app.fileManager,
							configuration: new ForgeConfiguration([]),
							suggester: new Modals(this.app, {
								FuzzySuggester,
								ObsidianPromptModal,
							}),
						});
						await worker.run(file);
					}
				},
			});
		}
	};
};

export default createPluginClass(Plugin as PluginConstructor);
