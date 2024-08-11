import van, { PropValueOrDerived } from "vanjs-core";
import {
  ForgeConfiguration,
  Command,
  SetValueOption,
  ArrayConfigurationOption,
  ValueOption,
  ValueType,
  ConstantValue,
} from "../configuration-schema";

import * as classNames from "./forge-editor.module.css";
import { Setting } from "./obsidian-controls";

// Silly implementation to help generate unique DOM ids, e.g. for
// <label id="input-1" /><input aria-labelledby="input-1" />.
// They don't need to be secure; just unique.
const genId = (() => {
  let __nextId = 1;
  return (pattern?: string) =>
    `${pattern ? pattern + "-" : ""}${(++__nextId).toString()}`;
})();

const { section, div, h3, h4, button, input, select, option, p, form } =
  van.tags;

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

const CommandHead = (
  props: Record<string, PropValueOrDerived> | string,
  text?: string,
) => {
  if (typeof props === "string") {
    text = props;
    props = {};
  }
  return h4(
    {
      ...props,
      className: classNames.commandHeading,
      "aria-label": `Command: ${text}`,
    },
    text,
  );
};

const CommandDescription = (text: string) =>
  p({ className: classNames.commandDescription }, text);

const ValueConfiguration = (props: {
  value: ConstantValue;
  onChange: (v: ConstantValue) => void;
}) => {
  switch (props.value.$type) {
    case "constant":
      return div(
        input({
          "aria-label": "Value",
          oninput: (e) => {
            props.onChange({ ...props.value, value: e.target.value });
          },
        }),
      );
    default:
      return div();
  }
};

const SetValueEditor = (props: {
  command: SetValueOption;
  headingId: string;
  onChange: (v: SetValueOption) => void;
}) => {
  return [
    CommandHead({ id: props.headingId }, "Set Value"),
    CommandDescription("Sets a single property in the frontmatter"),
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
    ValueConfiguration({
      value: props.command.value,
      onChange: (value) => {
        props.onChange({ ...props.command, value });
      },
    }),
  ];
};

const AddArrayElementEditor = (props: {
  headingId: string;
  command: ArrayConfigurationOption;
}) => {
  return [
    CommandHead({ id: props.headingId }, "Add element to array"),
    CommandDescription(
      "Assumes the element is an array. The generated value will be added to the array.",
    ),
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

const CommandEditor = (props: {
  command: Command;
  onChange: (c: Command) => void;
}) => {
  const { command, onChange } = props;
  const id = genId("command-section");
  switch (command.$command) {
    case "set-value":
      // Could have written, SetValueEditor(props), but TS
      // doesn't infer types correctly
      return section(
        { "aria-labelledBy": id },
        SetValueEditor({ command, headingId: id, onChange }),
      );
    case "add-array-element":
      return section(
        { "aria-labelledBy": id },
        AddArrayElementEditor({ command, headingId: id }),
      );
    default:
      return section(
        { "aria-labelledBy": id },
        UnknownCommandEditor({ command }),
      );
  }
};

const CommandList = (props: {
  commands: Command[];
  onChange: (c: Command[]) => void;
}) => [
  Setting({
    name: "Commands",
    description: "Enter the commands to run for this command",
    control: form(
      { className: classNames.newCommandForm },
      select(
        { className: "dropdown" },
        option({ value: "add-to-array" }, "Add to array"),
        option({ value: "set-value" }, "Set value"),
      ),
      button("New command"),
    ),
  }),
  props.commands.map((command, i) =>
    CommandEditor({
      command,
      onChange: (c) => {
        const cp = [...props.commands];
        cp[i] = c;
        props.onChange(cp);
      },
    }),
  ),
];

export function ForgeEditor({
  forgeConfig,
  onChange,
}: {
  forgeConfig: ForgeConfiguration;
  onChange: (c: ForgeConfiguration) => void;
}) {
  const id = genId("forge-config-heading");
  const name = van.state(forgeConfig.name);
  van.derive(() => onChange({ ...forgeConfig, name: name.val }));
  return section(
    {
      className: classNames.forgeConfigBlock,
      ["aria-labelledBy"]: id,
    },
    h3(
      {
        id,
        className: classNames.forgeConfigHeading,
        ["aria-label"]: `Forge: ${forgeConfig.name}`,
      },
      name,
    ),
    Setting({
      name: "Forge name",
      control: input({
        type: "text",
        value: forgeConfig.name,
        "aria-label": "Forge name",
        oninput: (e) => {
          name.val = e.target.value;
        },
      }),
    }),
    CommandList({
      commands: forgeConfig.commands,
      onChange: (commands) => {
        onChange({ ...forgeConfig, commands });
      },
    }),
  );
}
