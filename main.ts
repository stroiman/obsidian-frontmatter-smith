import { Editor, MarkdownView, Plugin, PluginManifest, App } from "obsidian";
import { Forge } from "./src/Forge";

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
			this.addCommand({
				id: "forge-frontmatter",
				name: "Forge frontmatter",
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					const file = view.file;
					if (file) {
						const worker = new Forge(this.app.fileManager);
						await worker.run(file);
					}
				},
			});
		}
	};
};

export default createPluginClass(Plugin as PluginConstructor);
