import { Editor, FileManager, MarkdownView, Plugin, TFile } from "obsidian";
import { FuzzySuggester } from "src/FuzzySuggester";
import { ObsidianPromptModal } from "src/ObsidianPromptModal";
import { Modals } from "src/modals";
import FrontmatterSmithSettingTab from "./PluginSettings";
import {
  PluginConfiguration,
  parseConfigurationOrDefault,
} from "src/plugin-configuration";
import RootRunner from "src/RootRunner";
import FrontmatterSmithAPI from "src/public-api";

export default class FrontmatterSmithPlugin extends Plugin {
  settings: PluginConfiguration;
  api: FrontmatterSmithAPI<TFile, FileManager>;

  async loadSettings() {
    const storedSettings = await this.loadData();
    this.settings = parseConfigurationOrDefault(storedSettings);
  }

  async onload() {
    await this.loadSettings();
    this.api = new FrontmatterSmithAPI({
      fileManager: this.app.fileManager,
      modals: new Modals(this.app, {
        FuzzySuggester,
        ObsidianPromptModal,
      }),
      getConfig: () => this.settings,
    });

    const handleSettingChange = (newValue: PluginConfiguration) => {
      this.settings = newValue;
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
