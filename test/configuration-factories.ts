import {
  ChoiceValue,
  SetValueCommand,
  StringInputValue,
  ChoiceValueItem,
  Command,
  AddToArrayCommand,
  ObjectValue,
  ObjectValueItem,
  ConstantValue,
  Value,
} from "src/smith-configuration-schema";

export const createStringInput = (
  input?: Partial<StringInputValue>,
): StringInputValue => {
  return { $type: "string-input", prompt: "Type something", ...input };
};

export const createConstantValue = (): ConstantValue => ({
  $type: "constant",
  value: "",
});

export const createObjectValue = (
  input?: Partial<ObjectValue>,
): ObjectValue => ({
  $type: "object",
  values: [],
});

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

export const createAddToArrayCommand = (
  input?: Partial<AddToArrayCommand>,
): AddToArrayCommand => {
  return {
    $command: "add-array-element",
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

  setPrompt(prompt: string): ChoiceValueBuilder {
    this.value.prompt = prompt;
    return this;
  }

  addItem(text: string, value?: string): ChoiceValueBuilder;
  addItem(
    f: BuildAction<ChoiceValueItemBuilder<ChoiceValueBuilder>>,
  ): ChoiceValueBuilder;
  addItem(
    x1: string | BuildAction<ChoiceValueItemBuilder<ChoiceValueBuilder>>,
    x2?: string,
  ) {
    if (typeof x1 === "function") {
      this.items.push(x1(new ChoiceValueItemBuilder(this)));
    } else {
      const builder = new ChoiceValueItemBuilder(this).setText(x1);
      if (x2) {
        builder.setValue(x2);
      }
      this.items.push(builder);
    }
    return this;
  }

  build(): ChoiceValue {
    return { ...this.value, options: this.items.map((x) => x.build()) };
  }
}

export class ObjectValueBuilder {
  value: ObjectValue;
  //values: ObjectValueItemBuilder[];

  constructor() {
    this.value = createObjectValue();
    //this.values = [];
  }

  addItem(f: BuildAction<ObjectValueItemBuilder>) {
    this.value.values.push(f(new ObjectValueItemBuilder()).build());
    return this;
  }

  build(): ObjectValue {
    return this.value;
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

class ObjectValueItemBuilder {
  item: ObjectValueItem;

  constructor() {
    this.item = { key: "", value: createConstantValue() };
  }

  setKey(key: string) {
    this.item.key = key;
    return this;
  }

  setValue(value: Value) {
    this.item.value = value;
    return this;
  }

  setValueF(f: (x: ValueBuilder) => Builder<Value>) {
    this.item.value = f(new ValueBuilder()).build();
    return this;
  }

  build(): ObjectValueItem {
    return this.item;
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

export const buildObjectValue = () => new ObjectValueBuilder();

interface Builder<T> {
  build(): T;
}

class ValueBuilder {
  choiceValue() {
    return new ChoiceValueBuilder();
  }
  objectValue() {
    return new ObjectValueBuilder();
  }
  stringInputWithPrompt(prompt: string) {
    return { build: () => createStringInput({ prompt }) };
  }
}
