import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";

export class FuzzySuggester<T> extends FuzzySuggestModal<T> {
  items: T[];
  getText: (item: T) => string;
  itemSelected: boolean;
  callback: (value: T | null) => void;

  constructor(
    app: App,
    items: T[],
    getText: (item: T) => string,
    callback: (value: T | null) => void,
  ) {
    super(app);
    this.getText = getText;
    this.itemSelected = false;
    this.items = items;
    this.callback = callback;
  }

  getItems(): T[] {
    return this.items;
  }

  getItemText(item: T): string {
    return this.getText(item);
  }

  onClose() {
    if (!this.itemSelected) {
      this.callback(null);
    }
  }

  selectSuggestion(
    value: FuzzyMatch<T>,
    evt: MouseEvent | KeyboardEvent,
  ): void {
    this.itemSelected = true;
    console.log("Selected");
    this.close();
    this.onChooseItem(value.item, evt);
    // this.callback(value.item);
  }

  onChooseItem(item: T, evt: MouseEvent | KeyboardEvent): void {
    this.callback(item);
  }
}

export type FuzzySuggesterConstructor = typeof FuzzySuggester;
