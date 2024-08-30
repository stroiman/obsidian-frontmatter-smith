import van, { State } from "vanjs-core";
import * as classNames from "./index.module.css";
import {
  Command,
  SetValueCommand,
  AddToArrayCommand,
} from "../../smith-configuration-schema";

import { Setting } from "../obsidian-controls";
import { deepState, genId, wrapState } from "../helpers";
import { button, div, h4, p, section, select, option } from "../tags";
import { renderValueEditor, ValueTypeEditor } from "../value-editor";
import { ChildGroup } from "../containers";
import { StateInput } from "../components";
import { migrateCommandToType } from "../defaults";

export type OnRemoveCommandClick = (x: {
  element: HTMLElement;
  command: State<Command>;
}) => void;

const CommandNameAndDesc = (props: {
  command: State<Command>;
  headingId: string;
  name: string;
  description: string;
  onRemoveClick: () => void;
}) => {
  const { headingId, name, command, description, onRemoveClick } = props;
  const dropdown = select(
    {
      className: "dropdown",
      ["aria-label"]: "Type of command",
      onchange: (e) => {
        command.val = migrateCommandToType(command.val, e.target.value);
      },
    },
    option(
      {
        value: "add-array-element",
        selected: command.val.$command === "add-array-element",
      },
      "Add to array",
    ),
    option(
      { value: "set-value", selected: command.val.$command === "set-value" },
      "Set value",
    ),
  );
  return div(
    { className: classNames.commandBlock },
    div(
      { className: classNames.commandBlockLeft },
      h4(
        {
          id: headingId,
          className: classNames.commandHeading,
          "aria-label": `Command: ${name}`,
        },
        name,
      ),
      p({ className: classNames.commandDescription }, description),
    ),
    dropdown,
    button(
      {
        onclick: () => {
          onRemoveClick();
        },
      },
      "Remove command",
    ),
  );
};

const SetValueEditor = (props: {
  command: State<SetValueCommand>;
  headingId: string;
  onRemoveClick: () => void;
}) => {
  const { command, headingId } = props;
  const { key, value } = deepState(command);
  return [
    CommandNameAndDesc({
      command,
      name: "Set Value",
      description: "Sets a single property in the frontmatter",
      headingId,
      onRemoveClick: props.onRemoveClick,
    }),
    Setting({
      name: "Key",
      description: "This is the name of the frontmatter field that will be set",
      control: StateInput({ type: "text", value: key, ["aria-label"]: "Key" }),
    }),
    Setting({
      name: "Value",
      description: "How will the value be generated",
      control: ValueTypeEditor({ value }),
    }),
    renderValueEditor(ChildGroup(), value),
  ];
};

const AddArrayElementEditor = (props: {
  headingId: string;
  command: State<AddToArrayCommand>;
  onRemoveClick: () => void;
}) => {
  const { headingId, onRemoveClick, command } = props;
  const { value, key } = deepState(command);
  return [
    CommandNameAndDesc({
      command,
      headingId,
      name: "Add element to array",
      description:
        "Assumes the element is an array. The generated value will be added to the array.",
      onRemoveClick,
    }),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be added to",
      control: StateInput({ type: "text", value: key, ["aria-label"]: "Key" }),
    }),
    Setting({
      name: "Value",
      description: "How will the value be generated",
      control: ValueTypeEditor({ value }),
    }),
    renderValueEditor(ChildGroup(), value),
  ];
};

const UnknownCommandEditor = (props: { command: never }) =>
  div(
    "The configuration contains an unrecognised element, and you will not be able to edit it",
  );

const renderEditor = (
  parent: HTMLElement,
  command: State<Command>,
  headingId: string,
  onRemoveClick: () => void,
) => {
  const commandType = van.derive(() => command.val.$command);
  const createCommand = () => {
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
  const renderCommand = () => {
    van.add(parent, createCommand());
  };
  van.derive(() => {
    if (commandType.val !== commandType.oldVal) {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      renderCommand();
    }
  });
  renderCommand();
};

export const CommandEditor = (props: {
  command: State<Command>;
  onRemoveCommandClick: OnRemoveCommandClick;
}) => {
  const { command } = props;
  const id = genId("command-section");
  const element = section({ "aria-labelledBy": id });
  renderEditor(element, command, id, () => {
    props.onRemoveCommandClick({ element, command });
  });
  return element;
};
