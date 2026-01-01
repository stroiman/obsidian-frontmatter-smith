import {
  defaultConfiguration,
  PluginConfiguration,
} from "src/plugin-configuration";
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
  ForgeConfiguration,
  SmithConfiguration,
} from "src/smith-configuration-schema";
import { deepFreeze } from "./configuration-editor/helpers";
import {
  AddPropertyCommand,
  createDefaultAddPropertyCommand,
} from "src/add-property";

const id = <T>(x: T): T => x;

let nextVal = 1;

const genId = () => {
  return "id-" + nextVal++;
};

export const createForge = (input?: Partial<ForgeConfiguration>) => ({
  $id: genId(),
  name: "",
  commands: [],
  ...input,
});

export const createStringInput = (
  input?: Partial<StringInputValue>,
): StringInputValue => {
  return { $type: "string-input", prompt: "Type something", ...input };
};

export const createConstantValue = (
  input?: Partial<ConstantValue>,
): ConstantValue => ({
  $type: "constant",
  value: "",
  ...input,
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
    $id: genId(),
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
    $id: genId(),
    $command: "add-array-element",
    key: "type",
    value: createStringInput(),
    ...input,
  };
};

export const createAddPropertyCommand = (
  input?: Partial<AddPropertyCommand>,
) => ({ ...createDefaultAddPropertyCommand(), ...input });

type BuildAction<T, U = T> = (x: T) => U;

export class ConstantValueBuilder {
  value: any;

  constructor() {
    this.value = "";
  }

  setValue(v: any) {
    this.value = v;
    return this;
  }

  build() {
    return createConstantValue({ value: this.value });
  }
}

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

  addConstItem(key: string, value: unknown) {
    this.value.values.push({
      $id: genId(),
      key,
      value: createConstantValue({ value }),
    });
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
    this.item = { $id: genId(), text: "", value: "", commands: [] };
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
    this.item = { $id: genId(), key: "", value: createConstantValue() };
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

  setValue(v: Value) {
    this.command.value = v;
    return this;
  }

  buildValue(f: (x: ValueBuilder) => Builder<Value>) {
    this.command.value = f(new ValueBuilder()).build();
    return this;
  }

  build() {
    return this.command;
  }
}

class CommandBuilder {
  setValue(): SetValueCommandBuilder {
    return new SetValueCommandBuilder();
  }
}

interface Builder<T> {
  build(): T;
}

class ValueBuilder {
  constantValue() {
    return new ConstantValueBuilder();
  }

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

class ForgeBuilder {
  forge: ForgeConfiguration;
  constructor() {
    this.forge = createForge();
  }

  setName(name: string) {
    this.forge.name = name;
    return this;
  }

  addCommand(f: (x: CommandBuilder) => Builder<Command>): ForgeBuilder {
    this.forge.commands.push(f(new CommandBuilder()).build());
    return this;
  }

  build(): ForgeConfiguration {
    return this.forge;
  }
}

export class SmithConfigurationBuilder {
  config: SmithConfiguration;

  constructor() {
    this.config = { version: "1", forges: [] };
  }

  addForge(f?: BuildAction<ForgeBuilder>) {
    this.config.forges.push((f || id)(new ForgeBuilder()).build());
    return this;
  }

  build() {
    return this.config;
  }
}

export class ConfigurationBuilder extends SmithConfigurationBuilder {
  buildC(): PluginConfiguration {
    return deepFreeze({
      ...defaultConfiguration,
      smithConfiguration: super.build(),
    });
  }
}

export const buildValue = () => new ChoiceValueBuilder();
export const buildObjectValue = () => new ObjectValueBuilder();
export const buildCommand = () => new CommandBuilder();
export const buildSmithConfiguration = (
  f: BuildAction<SmithConfigurationBuilder>,
) => {
  return f(new SmithConfigurationBuilder()).build();
};

export const buildPluginConfiguration = (
  f: BuildAction<ConfigurationBuilder>,
) => f(new ConfigurationBuilder()).buildC();

export const buildSingleForgeConfig = (f: BuildAction<ForgeBuilder>) =>
  buildPluginConfiguration((p) => p.addForge(f));

export const buildSingleCommandConfig = (
  fn: BuildAction<CommandBuilder, Builder<Command>>,
) => buildSingleForgeConfig((b) => b.addCommand(fn));
