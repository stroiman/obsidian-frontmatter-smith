import { App, PluginSettingTab, Plugin } from "obsidian";
import { render } from "src/configuration-editor";
import { SmithConfiguration } from "src/smith-configuration-schema";

export default class FrontmatterSmithSettingTab extends PluginSettingTab {
  private value: SmithConfiguration;

  constructor(
    app: App,
    plugin: Plugin,
    private onChange: (config: SmithConfiguration) => void,
  ) {
    super(app, plugin);
  }

  setValue(value: SmithConfiguration) {
    this.value = value;
  }

  hide() {
    const { containerEl } = this;
    while (containerEl.firstChild) {
      containerEl.removeChild(containerEl.firstChild);
    }
  }

  display() {
    const { containerEl } = this;
    containerEl.setCssStyles({
      display: "flex",
      flexDirection: "column",
    });
    containerEl.createEl("h1", { text: "Frontmatter Smith" });
    const p = containerEl.createEl("p", {
      text: "This plugin is in its very early stages. For more information about hot to configure, ",
    });

    p.createEl("a", {
      text: "Check the readme file for plugin",
      href: "https://github.com/stroiman/obsidian-frontmatter-smith",
    });

    const newEditor = containerEl.createDiv();
    render(newEditor, this.value, (config) => this.onChange(config));
  }
}
