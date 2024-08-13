import van, { PropValueOrDerived, State } from "vanjs-core";
import {
  ForgeConfiguration,
  Command,
  SetValueOption,
  ArrayConfigurationOption,
  ValueOption,
  ValueType,
  ConstantValue,
  StringInput,
  toSafeInput,
  CommandType,
} from "../configuration-schema";

import * as classNames from "./forge-editor.module.css";
import { Setting } from "./obsidian-controls";
import { ChoiceInputConfiguration } from "./choice-value-editor";
import { deepState, genId, stateArray } from "./helpers";
import { ChildGroup } from "./containers";
import { ObjectValueEditor } from "./object-value-editor";
import {
  defaultChoice,
  defaultCommandByType,
  defaultConstant,
  defaultNumberInput,
  defaultObjectInput,
  defaultStringInput,
} from "./defaults";

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

const ValueEditor = (props: { value: State<ValueOption> }) =>
  select(
    {
      className: "dropdown",
      "aria-label": "Type of value",
      onchange: (e) => {
        switch (e.target.value as ValueType) {
          case "constant":
            props.value.val = defaultConstant;
            break;
          case "string-input":
            props.value.val = defaultStringInput;
            break;
          case "number-input":
            props.value.val = defaultNumberInput;
            break;
          case "object":
            props.value.val = defaultObjectInput;
            break;
          case "choice-input":
            props.value.val = defaultChoice;
            break;
        }
        //console.log("CHANGE", e.target.value);
      },
    },
    optionDescriptors.map((option) =>
      Option({ ...option, selectedValue: props.value.val.$type }),
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

const StringInputConfiguration = (props: { value: State<StringInput> }) => {
  const { prompt } = deepState(props.value);
  return Setting({
    name: "Prompt",
    description: "This will be displayed in the prompt of the dialog",
    control: input({
      type: "text",
      value: props.value.val.prompt,
      "aria-label": "Prompt",
      oninput: (e) => {
        prompt.val = e.target.value;
      },
    }),
  });
};

/**
 * This function doesn't add _anything_ functionally.
 *
 * It creates a state of a specialised type, synchronising the changes back to a
 * state of a more general type. But at runtime, the two state values are
 * identical.
 *
 * It exists _only_ to make the TypeScript code be typesafe, i.e. avoiding type
 * casts, e.g. in order to have exhaustiveness check in the compiler.
 */
const wrapState = <T extends U, U>(val: T, state: State<U>): State<T> => {
  const result = van.state(val);
  van.derive(() => {
    const val = result.val;
    if (val !== result.oldVal) {
      state.val = val;
    }
  });
  return result;
};

export const ValueConfigurationInner = (props: {
  value: State<ValueOption>;
}) => {
  const tmp = props.value.val;
  switch (tmp.$type) {
    case "constant": {
      const value = wrapState(tmp, props.value);
      return ConstValueConfiguration({ value });
    }
    case "string-input":
    case "number-input": {
      const value = wrapState(tmp, props.value);
      return StringInputConfiguration({ value });
    }
    case "choice-input": {
      const value = wrapState(toSafeInput(tmp), props.value);
      return ChoiceInputConfiguration({ value });
    }
    case "object": {
      const value = wrapState(tmp, props.value);
      return ObjectValueEditor({ value });
    }
    default:
      return UnrecognisedValue({ value: tmp });
  }
};

export const ValueConfiguration = (props: { value: State<ValueOption> }) => {
  const { value } = props;
  const type = van.derive(() => value.val.$type);

  let result: HTMLElement = ValueConfigurationInner(props);
  const d = div(ValueEditor({ value }), result);
  van.derive(() => {
    const newType = type.val;
    if (newType !== type.oldVal) {
      d.removeChild(result);
      result = ValueConfigurationInner({ value });
      van.add(d, result);
    }
  });
  return d;
};

const UnrecognisedValue = (props: { value: never }) =>
  div(
    "Your configuration contains an unrecognised value, and you will not be able to edit it",
  );

const SetValueEditor = (props: {
  command: State<SetValueOption>;
  headingId: string;
  onRemoveClick: () => void;
}) => {
  const { command, headingId } = props;
  const { key } = command.val;
  const { value } = deepState(props.command);
  return [
    CommandHead({ id: headingId }, "Set Value"),
    CommandDescription("Sets a single property in the frontmatter"),
    button(
      {
        onclick: () => {
          props.onRemoveClick();
        },
      },
      "Remove command",
    ),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be created",
      control: input({ type: "text", value: key }),
    }),
    //Setting({
    //  name: "Value",
    //  description: "How will the value be generated",
    //  control: ValueEditor(props.command.val),
    //}),
    ValueConfiguration({ value }),
  ];
};

const AddArrayElementEditor = (props: {
  headingId: string;
  command: State<ArrayConfigurationOption>;
  onRemoveClick: () => void;
}) => {
  return [
    CommandHead({ id: props.headingId }, "Add element to array"),
    CommandDescription(
      "Assumes the element is an array. The generated value will be added to the array.",
    ),
    button(
      {
        onclick: () => {
          props.onRemoveClick();
        },
      },
      "Remove command",
    ),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be created",
      control: input({ type: "text", value: props.command.val.key }),
    }),
  ];
};

const UnknownCommandEditor = (props: { command: never }) =>
  div(
    "The configuration contains an unrecognised element, and you will not be able to edit it",
  );

const renderEditor = (
  command: State<Command>,
  headingId: string,
  onRemoveClick: () => void,
) => {
  const tmp = command.val;
  switch (tmp.$command) {
    case "set-value": {
      const result = wrapState(tmp, command);
      return SetValueEditor({ command: result, headingId, onRemoveClick });
    }
    case "add-array-element": {
      const result = wrapState(tmp, command);
      return AddArrayElementEditor({
        command: result,
        headingId,
        onRemoveClick,
      });
    }
    default:
      return UnknownCommandEditor({ command: tmp });
  }
};

type OnRemoveCommandClick = (x: {
  element: HTMLElement;
  command: State<Command>;
}) => void;

const CommandEditor = (props: {
  command: State<Command>;
  onRemoveCommandClick: OnRemoveCommandClick;
}) => {
  const { command } = props;
  const id = genId("command-section");
  const element = section(
    { "aria-labelledBy": id },
    //button(
    //  {
    //    onclick: () => {
    //      props.onRemoveCommandClick({ element, command });
    //    },
    //  },
    //  "Remove command",
    //),
    renderEditor(command, id, () => {
      props.onRemoveCommandClick({ element, command });
    }),
  );
  return element;
};

export const CommandList = (props: { commands: State<Command[]> }) => {
  const states = stateArray(props.commands);

  const onRemoveCommandClick: OnRemoveCommandClick = ({ element, command }) => {
    states.val = states.val.filter((x) => x !== command);
    children.removeChild(element);
  };
  const children = ChildGroup(
    states.val.map((command, i) =>
      CommandEditor({ command, onRemoveCommandClick }),
    ),
  );
  const dropdown = select(
    { className: "dropdown" },
    option({ value: "add-array-element" }, "Add to array"),
    option({ value: "set-value" }, "Set value"),
  );
  return [
    Setting({
      name: "Commands",
      description: "Enter the commands to run for this command",
      control: form(
        { className: classNames.newCommandForm },
        dropdown,
        button(
          {
            onclick: (e) => {
              e.preventDefault();
              const command = van.state(
                defaultCommandByType[dropdown.value as CommandType],
              );
              states.val = [...states.val, command];
              van.add(
                children,
                CommandEditor({ command, onRemoveCommandClick }),
              );
            },
          },
          "Add command",
        ),
      ),
    }),
    children,
  ];
};

export function ForgeEditor(props: { forgeConfig: State<ForgeConfiguration> }) {
  const id = genId("forge-config-heading");
  const { name, commands } = deepState(props.forgeConfig);
  return section(
    {
      className: classNames.forgeConfigBlock,
      ["aria-labelledBy"]: id,
    },
    h3(
      {
        id,
        className: classNames.forgeConfigHeading,
        ["aria-label"]: `Forge: ${name.val}`,
      },
      name,
    ),
    Setting({
      name: "Forge name",
      control: input({
        type: "text",
        value: name.val,
        "aria-label": "Forge name",
        oninput: (e) => {
          name.val = e.target.value;
        },
      }),
    }),
    CommandList({ commands }),
  );
}
