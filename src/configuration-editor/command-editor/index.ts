import { State } from "vanjs-core";
import * as classNames from "./index.module.css";
import {
  Command,
  SetValueOption,
  ArrayConfigurationOption,
} from "../../configuration-schema";

import { Setting } from "../obsidian-controls";
import { deepState, genId, wrapState } from "../helpers";
import { button, div, h4, input, p, section } from "../tags";
import { ValueConfiguration } from "../value-editor";

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
  command: State<SetValueOption>;
  headingId: string;
  onRemoveClick: () => void;
}) => {
  const { command, headingId } = props;
  const { key } = command.val;
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
      description:
        "This is the name of the frontmatter field that will be created",
      control: input({ type: "text", value: key }),
    }),
    ValueConfiguration({ value }),
  ];
};

const AddArrayElementEditor = (props: {
  headingId: string;
  command: State<ArrayConfigurationOption>;
  onRemoveClick: () => void;
}) => {
  const { headingId, onRemoveClick } = props;
  const { value } = deepState(props.command);
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
      control: input({ type: "text", value: props.command.val.key }),
    }),
    ValueConfiguration({ value }),
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
