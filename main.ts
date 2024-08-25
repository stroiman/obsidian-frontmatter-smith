import { Editor, MarkdownView, Plugin, PluginManifest, App } from "obsidian";
import { FuzzySuggester } from "src/FuzzySuggester";
import { ObsidianPromptModal } from "src/ObsidianPromptModal";
import { Modals } from "src/modals";
import SettingTab from "./PluginSettings";
import {
  GlobalConfiguration,
  parseConfigOrDefault,
} from "src/configuration-schema";
import RootRunner from "src/RootRunner";

interface PluginConstructor {
  new (app: App, manifest: PluginManifest): Plugin;
}

//declare module "Obsidian" {
//  declare var Plugin: PluginConstructor;
//}

const createPluginClass = (baseClass: PluginConstructor) => {
  return class MyPlugin extends baseClass {
    settings: GlobalConfiguration;

    async loadSettings() {
      const storedSettings = await this.loadData();
      this.settings = parseConfigOrDefault(storedSettings);
    }

    async onload() {
      await this.loadSettings();

      const handleSettingChange = (newValue: GlobalConfiguration) => {
        this.settings = newValue;
        settingsTab.setValue(newValue);
        this.saveData(newValue);
      };

      const settingsTab = new SettingTab(this.app, this, handleSettingChange);
      settingsTab.setValue(this.settings);
      this.addSettingTab(settingsTab);

      this.addCommand({
        id: "forge-frontmatter",
        name: "Forge frontmatter",
        editorCallback: async (editor: Editor, view: MarkdownView) => {
          const file = view.file;
          if (file) {
            const worker = new RootRunner(
              this.settings,
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
  };
};

export default createPluginClass(Plugin as PluginConstructor);
