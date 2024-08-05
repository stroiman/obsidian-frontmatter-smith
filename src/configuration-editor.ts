import van from "vanjs-core";
import {
  ForgeConfiguration,
  GlobalConfiguration,
  Command,
  SetValueOption,
  ArrayConfigurationOption,
  ValueOption,
  ValueType,
} from "./configuration-schema";
import * as classNames from "./configuration-editor.module.css";
import { Setting } from "./obsidian-controls";

const { div, h3, h4, button, input, select, option } = van.tags;

const Option = ({
  type,
  text,
  selectedValue,
}: {
  type: ValueType;
  text: string;
  selectedValue: ValueType;
}) => option({ value: type, selected: type === selectedValue }, text);

const optionDescriptors: { type: ValueType; text: string }[] = [
  {
    type: "choice-input",
    text: "Choice input",
  },
  {
    type: "object",
    text: "An object value",
  },
  {
    type: "constant",
    text: "A constant value",
  },
  {
    type: "string-input",
    text: "A text value",
  },
  {
    type: "number-input",
    text: "A numeric value",
  },
];

const ValueEditor = (props: { value: ValueOption }) =>
  select(
    { className: "dropdown" },
    optionDescriptors.map((option) =>
      Option({ ...option, selectedValue: props.value.$type }),
    ),
  );

const CommandHead = h4;

const SetValueEditor = (props: { command: SetValueOption }) => {
  return [
    CommandHead("Set Value"),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be created",
      control: input({ type: "text", value: props.command.key }),
    }),
    Setting({
      name: "Value",
      description: "How will the value be generated",
      control: ValueEditor(props.command),
    }),
  ];
};

const AddArrayElementEditor = (props: {
  command: ArrayConfigurationOption;
}) => {
  return [
    CommandHead("Add element to array"),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be created",
      control: input({ type: "text", value: props.command.key }),
    }),
  ];
};

const UnknownCommandEditor = (props: { command: never }) =>
  div(
    "The configuration contains an unrecognised element, and you will not be able to edit it",
  );

const CommandEditor = (props: { command: Command }) => {
  const { command } = props;
  switch (command.$command) {
    case "set-value":
      // Could have written, SetValueEditor(props), but TS
      // doesn't infer types correctly
      return SetValueEditor({ command });
    case "add-array-element":
      return AddArrayElementEditor({ command });
    default:
      return UnknownCommandEditor({ command });
  }
};

const CommandList = (props: { commands: Command[] }) => [
  Setting({
    name: "Commands",
    description: "Enter the commands to run for this command",
    control: button("New command"),
  }),
  props.commands.map((command) => CommandEditor({ command })),
];

const ForgeEditor = ({ forgeConfig }: { forgeConfig: ForgeConfiguration }) =>
  div(
    { className: classNames.forgeConfigBlock },
    h3(
      {
        className: classNames.forgeConfigHeading,
      },
      forgeConfig.name,
    ),
    CommandList({ commands: forgeConfig.commands }),
  );

const ConfigurationEditor = (props: { config: GlobalConfiguration }) => {
  const forges = props.config.forges;
  return div(
    { className: classNames.forgeConfig },
    Setting({
      name: "Forges",
      description:
        'A "forge" is a set of rules for populating frontmatter. A forge can generate multiple fields, and the fields generated can depend on previous choices',
      control: button("New forge"),
    }),
    forges.map((c) => ForgeEditor({ forgeConfig: c })),
  );
};

export const render = (root: HTMLElement, config: GlobalConfiguration) => {
  van.add(root, ConfigurationEditor({ config }));
};
