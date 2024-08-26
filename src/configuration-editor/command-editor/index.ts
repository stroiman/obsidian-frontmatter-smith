import { State } from "vanjs-core";
import * as classNames from "./index.module.css";
import {
  Command,
  SetValueCommand,
  AddToArrayCommand,
} from "../../configuration-schema";

import { Setting } from "../obsidian-controls";
import { deepState, genId, wrapState } from "../helpers";
import { button, div, h4, p, section } from "../tags";
import { renderValueEditor, ValueTypeEditor } from "../value-editor";
import { ChildGroup } from "../containers";
import { StateInput } from "../components";

export type OnRemoveCommandClick = (x: {
  element: HTMLElement;
  command: State<Command>;
}) => void;

const CommandNameAndDesc = (props: {
  headingId: string;
  name: string;
  description: string;
  onRemoveClick: () => void;
}) => {
  const { headingId, name, description, onRemoveClick } = props;
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
  const { key } = deepState(command);
  const { value } = deepState(props.command);
  return [
    CommandNameAndDesc({
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
  const { value } = deepState(props.command);
  const { key } = deepState(command);
  return [
    CommandNameAndDesc({
      headingId,
      name: "Add element to array",
      description:
        "Assumes the element is an array. The generated value will be added to the array.",
      onRemoveClick,
    }),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be created",
      control: StateInput({ type: "text", value: key, ["aria-label"]: "Key" }),
    }),
    //ValueConfiguration({ value }),
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

export const CommandEditor = (props: {
  command: State<Command>;
  onRemoveCommandClick: OnRemoveCommandClick;
}) => {
  const { command } = props;
  const id = genId("command-section");
  const element = section(
    { "aria-labelledBy": id },
    renderEditor(command, id, () => {
      props.onRemoveCommandClick({ element, command });
    }),
  );
  return element;
};
