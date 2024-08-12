import van, { PropValueOrDerived, State } from "vanjs-core";
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

const ConstValueConfiguration = (props: { value: State<ConstantValue> }) => {
  const id = genId("input-error");
  const valid = van.state(true);
  const touched = van.state(false);
  const showError = van.derive(() => touched.val && !valid.val);
  const i = input({
    "aria-label": "Value",
    "aria-errormessage": id,
    "aria-invalid": van.derive(() => (showError.val ? "true" : "false")),
    type: "text",
    onblur: () => {
      touched.val = true;
    },
    oninput: (e) => {
      try {
        props.value.val = {
          ...props.value.val,
          value: JSON.parse(e.target.value),
        };
        valid.val = true;
      } catch {
        valid.val = false;
      }
    },
  });
  const err = p(
    {
      id,
      style: van.derive(() =>
        showError.val ? "display: block" : "display: none",
      ),
      className: classNames.errorMsg,
    },
    "Invalid JSON",
  );
  return div(
    Setting({
      name: "Value",
      description:
        "The 'value', must be valid JSON format. This allows the value to be simple text values, or complex objects or arrays. For a text value, the correct format is to enclose the value in quotation marks ( \" )",
      control: div(i, err),
    }),
  );
};

const ValueConfiguration = (props: { value: State<ValueOption> }) => {
  const { value } = props;
  switch (value.val.$type) {
    case "constant":
      return ConstValueConfiguration({
        value: value as State<ConstantValue>,
      });
    default:
      return div();
  }
};

const SetValueEditor = (props: {
  command: State<SetValueOption>;
  headingId: string;
}) => {
  const { command, headingId } = props;
  const { key } = command.val;
  const value = van.state(command.val.value);
  van.derive(() => (command.val = { ...command.val, value: value.val }));
  return [
    CommandHead({ id: headingId }, "Set Value"),
    CommandDescription("Sets a single property in the frontmatter"),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be created",
      control: input({ type: "text", value: key }),
    }),
    Setting({
      name: "Value",
      description: "How will the value be generated",
      control: ValueEditor(props.command.val),
    }),
    ValueConfiguration({ value }),
  ];
};

const AddArrayElementEditor = (props: {
  headingId: string;
  command: State<ArrayConfigurationOption>;
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
      control: input({ type: "text", value: props.command.val.key }),
    }),
  ];
};

const UnknownCommandEditor = (props: { command: State<never> }) =>
  div(
    "The configuration contains an unrecognised element, and you will not be able to edit it",
  );

const renderEditor = (command: State<Command>, headingId: string) => {
  const tmp = command.val;
  // Creating _new_ state values is completely unnecessary, this
  // is to get TypeScript to compile properly, AND have
  // exhaustiveness check.
  switch (tmp.$command) {
    case "set-value": {
      const result = van.state(tmp);
      van.derive(() => {
        command.val = result.val;
      });
      return SetValueEditor({ command: result, headingId });
    }
    case "add-array-element": {
      const result = van.state(tmp);
      van.derive(() => {
        command.val = result.val;
      });
      return AddArrayElementEditor({ command: result, headingId });
    }
    default:
      return UnknownCommandEditor({ command: van.state(tmp) });
  }
};

const CommandEditor = (props: { command: State<Command> }) => {
  const { command } = props;
  const id = genId("command-section");
  return section({ "aria-labelledBy": id }, renderEditor(command, id));
};

const CommandList = (props: { commands: State<Command[]> }) => {
  const states = props.commands.val.map((command) => van.state(command));
  van.derive(() => (props.commands.val = states.map((x) => x.val)));
  return [
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
    states.map((command, i) => CommandEditor({ command })),
  ];
};

export function ForgeEditor({
  forgeConfig,
  onChange,
}: {
  forgeConfig: ForgeConfiguration;
  onChange: (c: ForgeConfiguration) => void;
}) {
  const id = genId("forge-config-heading");
  const name = van.state(forgeConfig.name);
  const commands = van.state(forgeConfig.commands);
  van.derive(() =>
    onChange({ ...forgeConfig, name: name.val, commands: commands.val }),
  );
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
    CommandList({ commands }),
  );
}
