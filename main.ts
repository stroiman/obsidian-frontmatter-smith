import { Editor, MarkdownView, Plugin, PluginManifest, App } from "obsidian";

interface PluginConstructor {
	new (app: App, manifest: PluginManifest): Plugin;
}

declare module "obsidian" {
	declare var Plugin: PluginConstructor;
}

const createPluginClass = (baseClass: PluginConstructor) => {
	return class MyPlugin extends baseClass {
		async onload() {
			console.log("Loaded my plugin");
			this.addCommand({
				id: "forge-frontmatter",
				name: "Forge frontmatter",
				editorCallback: (editor: Editor, view: MarkdownView) => {
					console.log(editor.getSelection());
					editor.replaceSelection("Sample Editor Command");
				},
			});
			// This adds a complex command that can check whether the current state of the app allows execution of the command
			// this.addCommand({
			// 	id: 'open-sample-modal-complex',
			// 	name: 'Open sample modal (complex)',
			// 	checkCallback: (checking: boolean) => {
			// 		// Conditions to check
			// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			// 		if (markdownView) {
			// 			// If checking is true, we're simply "checking" if the command can be run.
			// 			// If checking is false, then we want to actually perform the operation.
			// 			if (!checking) {
			// 				new SampleModal(this.app).open();
			// 			}
			//
			// 			// This command will only show up in Command Palette when the check function returns true
			// 			return true;
			// 		}
			// 	}
			// });

			// // This adds a settings tab so the user can configure various aspects of the plugin
			// this.addSettingTab(new SampleSettingTab(this.app, this));
			//
			// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
			// // Using this function will automatically remove the event listener when this plugin is disabled.
			// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// 	console.log('click', evt);
			// });
			//
			// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
			// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		}
	};
};

export default createPluginClass(Plugin);
