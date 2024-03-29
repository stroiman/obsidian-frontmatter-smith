import { App, FuzzyMatch, FuzzySuggestModal, SuggestModal } from "obsidian";
import type {
	FuzzySuggester,
	FuzzySuggesterConstructor,
} from "./FuzzySuggester";
import type {
	ObsidianPromptModal,
	ObsidianPromptModalConstructor,
	PromptOptions,
} from "./ObsidianPromptModal";

export class Suggester {
	#app: App;
	#FuzzySuggester: FuzzySuggesterConstructor;

	constructor(app: App, FuzzySuggester: FuzzySuggesterConstructor) {
		this.#app = app;
		this.#FuzzySuggester = FuzzySuggester;
	}

	suggest<T extends { text: string }>(
		items: T[],
		placeholder?: string,
	): Promise<T | null> {
		return new Promise<T | null>((resolve, reject) => {
			const suggester = new this.#FuzzySuggester<T>(
				this.#app,
				items,
				(x) => x.text,
				(x) => resolve(x),
			);
			if (placeholder) {
				suggester.setPlaceholder(placeholder);
			}
			suggester.open();
		});
	}
}

export class PromtModal {
	#app: App;
	#PromptConstructor: ObsidianPromptModalConstructor;
	constructor(app: App, PromptConstructor: ObsidianPromptModalConstructor) {
		this.#app = app;
		this.#PromptConstructor = PromptConstructor;
	}

	prompt(options: PromptOptions): Promise<string | null> {
		return new Promise<string | null>((resolve, reject) => {
			const suggester = new this.#PromptConstructor(
				this.#app,
				options,
				resolve,
			);
			suggester.open();
		});
	}
}
