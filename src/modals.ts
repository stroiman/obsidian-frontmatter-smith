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

type Constructors = {
	ObsidianPromptModal: ObsidianPromptModalConstructor;
	FuzzySuggester: FuzzySuggesterConstructor;
};

export class Modals {
	#app: App;
	#constructors: Constructors;
	constructor(app: App, constructors: Constructors) {
		this.#app = app;
		this.#constructors = constructors;
	}

	prompt(options: PromptOptions): Promise<string | null> {
		return new Promise<string | null>((resolve, reject) => {
			const suggester = new this.#constructors.ObsidianPromptModal(
				this.#app,
				options,
				resolve,
			);
			suggester.open();
		});
	}

	suggest<T extends { text: string }>(
		items: T[],
		placeholder?: string,
	): Promise<T | null> {
		return new Promise<T | null>((resolve, reject) => {
			const suggester = new this.#constructors.FuzzySuggester<T>(
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

export type Suggester = Pick<Modals, "suggest">;
export type Promt = Pick<Modals, "prompt">;
