import {
  App,
  ButtonComponent,
  Modal,
  Platform,
  TextAreaComponent,
  TextComponent,
} from "obsidian";

export type PromptOptions = {
  prompt: string;
  defaultValue?: string;
  multiLine?: boolean;
};

export class ObsidianPromptModal extends Modal {
  private submitted = false;
  private value: string;
  private prompt: string;
  private defaultValue?: string;
  private cb: (value: string | null) => void;

  constructor(
    app: App,
    options: PromptOptions,
    cb: (value: string | null) => void,
  ) {
    super(app);
    this.prompt = options.prompt;
    this.defaultValue = options.defaultValue;
    this.cb = cb;
  }

  onOpen(): void {
    this.titleEl.setText(this.prompt);
    this.titleEl.id = "frontmatter-forge-prompt-label";
    this.createForm();
  }

  onClose(): void {
    this.contentEl.empty();
    if (!this.submitted) {
      this.cb(null);
    }
  }

  createForm(): void {
    const form = this.contentEl.createDiv().createEl("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitted = true;
      this.close();
      this.cb(this.value);
    });
    form.addClass("templater-prompt-div");
    const textInput = new TextComponent(form);
    textInput.inputEl.style.setProperty("width", "100%");
    textInput.inputEl.setAttribute(
      "aria-labelledby",
      "frontmatter-forge-prompt-label",
    );

    this.value = this.defaultValue || "";
    textInput.setPlaceholder("Type text here");
    textInput.setValue(this.value);
    textInput.onChange((value) => (this.value = value));
    textInput.inputEl.focus();
  }
}

export type ObsidianPromptModalConstructor = typeof ObsidianPromptModal;
