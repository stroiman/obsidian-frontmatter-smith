import { Editor, MarkdownView, Plugin } from "obsidian";
import { FuzzySuggester } from "src/FuzzySuggester";
import { ObsidianPromptModal } from "src/ObsidianPromptModal";
import { Modals } from "src/modals";
import FrontmatterSmithSettingTab from "./PluginSettings";
import {
  PluginConfiguration,
  parseConfigurationOrDefault,
} from "src/plugin-configuration";
import RootRunner from "src/RootRunner";

class FrontmatterSmithAPI {
  test() {
    console.log("Test");
  }
}

export default class FrontmatterSmithPlugin extends Plugin {
  settings: PluginConfiguration;
  api: FrontmatterSmithAPI;

  async loadSettings() {
    const storedSettings = await this.loadData();
    this.settings = parseConfigurationOrDefault(storedSettings);
  }

  async onload() {
    await this.loadSettings();
    this.api = new FrontmatterSmithAPI();

    const handleSettingChange = (newValue: PluginConfiguration) => {
      this.settings = newValue;
      settingsTab.setValue(newValue);
      this.saveData(newValue);
    };

    const settingsTab = new FrontmatterSmithSettingTab(
      this.app,
      this,
      handleSettingChange,
    );
    settingsTab.setValue(this.settings);
    this.addSettingTab(settingsTab);

    this.addCommand({
      id: "forge-frontmatter",
      name: "Forge frontmatter",
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        const file = view.file;
        if (file) {
          const worker = new RootRunner(
            this.settings.smithConfiguration,
            this.app.fileManager,
            new Modals(this.app, {
              FuzzySuggester,
              ObsidianPromptModal,
            }),
          );
          await worker.run(file);
        }
      },
    });
  }
}
