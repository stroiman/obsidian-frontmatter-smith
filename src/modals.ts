import { App, FuzzyMatch, FuzzySuggestModal, SuggestModal } from "obsidian";
import type { FuzzySuggester } from "./FuzzySuggester";

interface FuzzySuggesterConstructor {
	new <T>(
		app: App,
		items: T[],
		getText: (item: T) => string,
		cb: (item: T | null) => void,
	): FuzzySuggester<T>;
}

export class Suggester {
	#app: App;
	#FuzzySuggester: FuzzySuggesterConstructor;
	constructor(app: App, FuzzySuggester: FuzzySuggesterConstructor) {
		this.#app = app;
	}

	// suggestString(items: string[]): Promise<string | null> {
	// 	return new Promise((resolve, reject) => {
	// 		new FuzzySuggester<string>(this.app, items, (x) => x, resolve).open();
	// 	});
	// }

	suggest<T>(items: T[], getText: (x: T) => string): Promise<T | null> {
		return new Promise<T | null>((resolve, reject) => {
			new this.#FuzzySuggester<T>(this.#app, items, getText, (x) =>
				resolve(x),
			).open();
		});
	}
}
