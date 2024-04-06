import { Setting, App, PluginSettingTab, Plugin } from "obsidian";

export default class FrontmatterSmithSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		plugin: Plugin,
		private onChange: (config: string) => void,
	) {
		super(app, plugin);
	}

	display() {
		let { containerEl } = this;
		containerEl.createEl("h1", { text: "Frontmatter Smith" });

		new Setting(containerEl)
			.setName("Configuration")
			.addTextArea((component) => {
				component.setValue("Initial value");
				component.onChange((newValue) => {
					this.onChange(newValue);
				});
			});
	}
}
