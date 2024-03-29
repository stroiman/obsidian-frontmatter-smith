import { App, FuzzyMatch, FuzzySuggestModal, SuggestModal } from "obsidian";

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

export class Suggester {
	app: App;
	constructor(app: App) {
		this.app = app;
	}

	suggestString(items: string[]): Promise<string | null> {
		return new Promise((resolve, reject) => {
			new FuzzySuggester<string>(this.app, items, (x) => x, resolve).open();
		});
	}

	suggest<T>(items: T[], getText: (x: T) => string): Promise<T | null> {
		return new Promise<T | null>((resolve, reject) => {
			new FuzzySuggester<T>(this.app, items, getText, (x) => resolve(x)).open();
		});
	}
}
