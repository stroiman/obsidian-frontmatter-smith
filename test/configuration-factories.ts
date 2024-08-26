import {
  ChoiceValue,
  SetValueCommand,
  StringInputValue,
  ChoiceValueItem,
  Command,
} from "src/smith-configuration-schema";

export const createStringInput = (
  input?: Partial<StringInputValue>,
): StringInputValue => {
  return { $type: "string-input", prompt: "Type something", ...input };
};

export const createChoiceValue = (
  input?: Partial<ChoiceValue>,
): ChoiceValue => ({
  $type: "choice-input",
  prompt: "Choose type",
  options: [],
  ...input,
});

export const createSetValueCommand = (
  input?: Partial<SetValueCommand>,
): SetValueCommand => {
  return {
    $command: "set-value",
    key: "type",
    value: createStringInput(),
    ...input,
  };
};

type BuildAction<T> = (x: T) => T;

export class ChoiceValueBuilder {
  value: ChoiceValue;
  items: ChoiceValueItemBuilder<ChoiceValueBuilder>[];

  constructor() {
    this.value = createChoiceValue();
    this.items = [];
  }

  addItem(f: BuildAction<ChoiceValueItemBuilder<ChoiceValueBuilder>>) {
    this.items.push(f(new ChoiceValueItemBuilder(this)));
    return this;
  }

  build(): ChoiceValue {
    return { ...this.value, options: this.items.map((x) => x.build()) };
  }
}

class ChoiceValueItemBuilder<TPop> {
  pop: TPop;
  item: ChoiceValueItem;

  constructor(pop: TPop) {
    this.pop = pop;
    this.item = { text: "", value: "", commands: [] };
  }

  setText(text: string) {
    this.item.text = text;
    return this;
  }
  setValue(value: string) {
    this.item.value = value;
    return this;
  }

  setCommands(commands: Command[]) {
    this.item.commands = commands;
    return this;
  }

  addSetValueCommand(action: BuildAction<SetValueCommandBuilder>) {
    this.item.commands.push(action(new SetValueCommandBuilder()).build());
    return this;
  }

  build(): ChoiceValueItem {
    return this.item;
  }

  endValue(): TPop {
    return this.pop;
  }
}

class SetValueCommandBuilder {
  command: SetValueCommand;

  constructor() {
    this.command = createSetValueCommand();
  }

  setKey(key: string) {
    this.command.key = key;
    return this;
  }

  build() {
    return this.command;
  }
}

export const buildValue = () => new ChoiceValueBuilder();
