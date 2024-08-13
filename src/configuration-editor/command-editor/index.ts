import { PropValueOrDerived, State } from "vanjs-core";
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
