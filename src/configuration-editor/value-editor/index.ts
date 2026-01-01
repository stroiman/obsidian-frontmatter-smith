import van, { State } from "vanjs-core";
import * as classNames from "./index.module.css";
import {
  Value,
  ValueType,
  ConstantValue,
  StringInputValue,
} from "../../smith-configuration-schema";

import { Setting } from "../obsidian-controls";
import { ChoiceInputConfiguration } from "./choice-value-editor";
import { deepState, genId, stateArray, wrapState } from "../helpers";
import { ChildGroup } from "../containers";
import { ObjectValueEditor } from "./object-value-editor";
import {
  createDefaultChoiceValue,
  createDefaultCommand,
  createDefaultNumberInputValue,
  createDefaultObjectValue,
  createDefaultStringInputValue,
} from "../defaults";
import { CommandEditor, OnRemoveCommandClick } from "../command-editor";
import { button, div, input, option, p, select } from "../tags";
import { EditorConfigWrapper } from "../types";
import { Command } from "src/commands";

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

const ConstValueConfiguration = (props: { value: State<ConstantValue> }) => {
  const id = genId("input-error");
  const valid = van.state(true);
  const touched = van.state(false);
  const showError = van.derive(() => touched.val && !valid.val);
  const i = input({
    "aria-label": "Value",
    "aria-errormessage": id,
    "aria-invalid": van.derive(() => (showError.val ? "true" : "false")),
    value: JSON.stringify(props.value.val.value),
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
      name: "Constant",
      description:
        "The constant 'value', must be valid JSON format. This allows the value to be simple text values, or complex objects or arrays. For a text value, the correct format is to enclose the value in quotation marks ( \" )",
      control: div(i, err),
    }),
  );
};

const ValueConfigurationInner = (props: {
  value: State<Value>;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { editorConfiguration } = props;
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
      const value = wrapState(tmp, props.value);
      return ChoiceInputConfiguration({ value, editorConfiguration });
    }
    case "object": {
      const value = wrapState(tmp, props.value);
      return ObjectValueEditor({ value, editorConfiguration });
    }
    default:
      return UnrecognisedValue({ value: tmp });
  }
};

export const ValueTypeEditor = (props: { value: State<Value> }) =>
  select(
    {
      className: "dropdown",
      "aria-label": "Type of value",
      onchange: (e) => {
        switch (e.target.value as ValueType) {
          case "constant":
            props.value.val = createDefaultChoiceValue();
            break;
          case "string-input":
            props.value.val = createDefaultStringInputValue();
            break;
          case "number-input":
            props.value.val = createDefaultNumberInputValue();
            break;
          case "object":
            props.value.val = createDefaultObjectValue();
            break;
          case "choice-input":
            props.value.val = createDefaultChoiceValue();
            break;
        }
        //console.log("CHANGE", e.target.value);
      },
    },
    optionDescriptors.map((option) =>
      Option({ ...option, selectedValue: props.value.val.$type }),
    ),
  );

const StringInputConfiguration = (props: {
  value: State<StringInputValue>;
}) => {
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

const UnrecognisedValue = (props: { value: never }) =>
  div(
    "Your configuration contains an unrecognised value, and you will not be able to edit it",
  );

export const CommandList = (props: {
  commands: State<Command[]>;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const states = stateArray(props.commands);
  const { editorConfiguration } = props;

  const onRemoveCommandClick: OnRemoveCommandClick = ({ element, command }) => {
    states.val = states.val.filter((x) => x !== command);
    children.removeChild(element);
  };
  const children = ChildGroup(
    states.val.map((command, i) =>
      div(
        { className: classNames.commandWrapper },
        CommandEditor({ command, onRemoveCommandClick, editorConfiguration }),
      ),
    ),
  );
  return [
    Setting({
      name: "Commands",
      description: "Enter the commands to run for this command",
      control: button(
        {
          onclick: (e) => {
            e.preventDefault();
            const command = van.state(createDefaultCommand());
            states.val = [...states.val, command];
            van.add(
              children,
              CommandEditor({
                command,
                onRemoveCommandClick,
                editorConfiguration,
              }),
            );
          },
        },
        "Add command",
      ),
    }),
    children,
  ];
};

/**
 * Logic that reacts to the value changing 'type'. This removes the current
 * editor and renders a new for the new type.
 *
 * Note, the editor will be the last child of the passed parent.
 */
export const renderValueEditor = (
  parent: HTMLElement,
  value: State<Value>,
  editorConfiguration: EditorConfigWrapper,
) => {
  const type = van.derive(() => value.val.$type);
  let editor: HTMLElement = ValueConfigurationInner({
    value,
    editorConfiguration,
  });
  van.add(parent, editor);
  van.derive(() => {
    if (type.val !== type.oldVal) {
      parent.removeChild(editor);
      editor = ValueConfigurationInner({ value, editorConfiguration });
      van.add(parent, editor);
    }
  });
  return parent;
};

export const ValueConfiguration = (props: {
  value: State<Value>;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { value, editorConfiguration } = props;

  return renderValueEditor(
    div(ValueTypeEditor({ value })),
    value,
    editorConfiguration,
  );
};
