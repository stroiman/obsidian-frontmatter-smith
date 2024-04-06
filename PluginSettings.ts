import { collect } from "fp-ts/lib/ReadonlyRecord";
import {
	Setting,
	App,
	PluginSettingTab,
	Plugin,
	TextAreaComponent,
} from "obsidian";
import {
	GlobalConfiguration,
	isConfigurationValid,
} from "src/configuration-schema";

export default class FrontmatterSmithSettingTab extends PluginSettingTab {
	private value: GlobalConfiguration;

	constructor(
		app: App,
		plugin: Plugin,
		private onChange: (config: GlobalConfiguration) => void,
	) {
		super(app, plugin);
	}

	setValue(value: GlobalConfiguration) {
		this.value = value;
	}

	hide() {
		let { containerEl } = this;
		while (containerEl.firstChild) {
			containerEl.removeChild(containerEl.firstChild);
		}
	}

	display() {
		let { containerEl } = this;
		containerEl.setCssStyles({
			display: "flex",
			flexDirection: "column",
		});
		containerEl.createEl("h1", { text: "Frontmatter Smith" });
		containerEl.createEl("p", {
			text: "This plugin is in its very early stages. Config is very crude",
		});

		containerEl.createEl("a", {
			text: "Check the readme file for documentation of the syntax",
			href: "https://github.com/stroiman/obsidian-frontmatter-smith",
		});

		const div = containerEl.createDiv();
		div.setCssStyles({
			flexGrow: "1",
			display: "flex",
			margin: "1rem 0 0",
		});
		div
			.createEl("textarea", {}, (el) => {
				el.value = JSON.stringify(this.value, null, 2);
				el.addEventListener("input", (e: any) => {
					console.log("ONCHANGE");
					const newValue = e.target.value;
					try {
						const parsed: unknown = JSON.parse(newValue);
						hideInvalidJsonMessage();
						if (isConfigurationValid(parsed)) {
							this.onChange(parsed);
							hideInvalidConfigMessage();
						} else {
							showInvalidConfigMessage();
						}
					} catch {
						showInvalidJsonMessage();
					}
				});
				// const component = el as TextAreaComponent;
				// component.setValue(this.value);
				// component.onChange((newValue) => {
				// 	try {
				// 		const parsed: unknown = JSON.parse(newValue);
				// 		hideInvalidJsonMessage();
				// 		if (isConfigurationValid(parsed)) {
				// 			this.onChange(parsed);
				// 			hideInvalidConfigMessage();
				// 		} else {
				// 			showInvalidConfigMessage();
				// 		}
				// 	} catch {
				// 		showInvalidJsonMessage();
				// 	}
				// });
			})
			.setCssStyles({ flexGrow: "1" });

		const invalidConfigEl = containerEl.createEl(
			"div",
			{ text: "Not a valid configuration" },
			(el) => {
				el.setCssStyles({
					display: "none",
				});
			},
		);
		const invalidJsonEl = containerEl.createEl(
			"div",
			{ text: "Invalid JSON" },
			(el) => {
				el.setCssStyles({
					display: "none",
				});
			},
		);

		const showInvalidJsonMessage = () => {
			invalidJsonEl.setCssStyles({ display: "block" });
		};
		const hideInvalidJsonMessage = () => {
			invalidJsonEl.setCssStyles({ display: "none" });
		};
		const showInvalidConfigMessage = () => {
			invalidConfigEl.setCssStyles({ display: "block" });
		};
		const hideInvalidConfigMessage = () => {
			invalidConfigEl.setCssStyles({ display: "none" });
		};
	}
}
