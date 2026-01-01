import van, { State } from "vanjs-core";
import * as classNames from "./index.module.css";
import { CommandType } from "../../smith-configuration-schema";

import { Setting } from "../obsidian-controls";
import { deepState, genId, wrapState } from "../helpers";
import { button, div, h4, p, section, select, option } from "../tags";
import { renderValueEditor, ValueTypeEditor } from "../value-editor";
import { ChildGroup } from "../containers";
import { StateInput } from "../components";
import { migrateCommandToType } from "../defaults";
import { EditorConfigWrapper } from "../types";
import {
  AddPropertyCommand,
  CommandTypeAddProperty,
} from "src/commands/add-property";
import { CommandTypeSetValue, SetValueCommand } from "src/commands/set-value";
import { CommandTypeSetTag, SetTagCommand } from "src/commands/set-tag";
import {
  AddToArrayCommand,
  CommandTypeAddToArray,
} from "src/commands/add-to-array";
import { Command } from "src/commands";

export type OnRemoveCommandClick = (x: {
  element: HTMLElement;
  command: State<Command>;
}) => void;

const commandOption = (
  type: CommandType,
  name: string,
  command: State<Command>,
) =>
  option(
    {
      value: type,
      selected: command.val.$command === type,
    },
    name,
  );

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
    commandOption(CommandTypeAddToArray, "Add to array", command),
    commandOption(CommandTypeSetValue, "Set value", command),
    commandOption(CommandTypeAddProperty, "Add property", command),
    commandOption(CommandTypeSetTag, "Set tag", command),
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
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { command, headingId, editorConfiguration } = props;
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
    renderValueEditor(ChildGroup(), value, editorConfiguration),
  ];
};

const AddPropertyEditor = (props: {
  headingId: string;
  command: State<AddPropertyCommand>;
  onRemoveClick: () => void;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { headingId, onRemoveClick, command } = props;
  const { key } = deepState(command);
  return [
    CommandNameAndDesc({
      command,
      headingId,
      name: "Add property",
      description:
        "Adds an empty property to the frontmatter. Does nothing if the property already exists.",
      onRemoveClick,
    }),
    Setting({
      name: "Key",
      description:
        "This is the name of the frontmatter field that will be added to",
      control: StateInput({ type: "text", value: key, ["aria-label"]: "Key" }),
    }),
  ];
};

const SetTagEditor = (props: {
  headingId: string;
  command: State<SetTagCommand>;
  onRemoveClick: () => void;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { headingId, onRemoveClick, command } = props;
  const { tag } = deepState(command);
  return [
    CommandNameAndDesc({
      command,
      headingId,
      name: "Set tag",
      description: "Sets a tag (sorts the tag list alphabetically)",
      onRemoveClick,
    }),
    Setting({
      name: "Key",
      description: "The tag ",
      control: StateInput({ type: "text", value: tag, ["aria-label"]: "Tag" }),
    }),
  ];
};

const AddArrayElementEditor = (props: {
  headingId: string;
  command: State<AddToArrayCommand>;
  onRemoveClick: () => void;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { headingId, onRemoveClick, command, editorConfiguration } = props;
  const { value, key } = deepState(command);
  return [
    CommandNameAndDesc({
      command,
      headingId,
      name: "Add property",
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
    renderValueEditor(ChildGroup(), value, editorConfiguration),
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
  editorConfiguration: EditorConfigWrapper,
) => {
  const commandType = van.derive(() => command.val.$command);
  const createCommand = () => {
    const tmp = command.val;
    const data = { headingId, onRemoveClick, editorConfiguration };
    switch (tmp.$command) {
      case CommandTypeSetValue: {
        const result = wrapState(tmp, command);
        return SetValueEditor({
          command: result,
          ...data,
        });
      }
      case CommandTypeAddToArray: {
        const result = wrapState(tmp, command);
        return AddArrayElementEditor({
          command: result,
          ...data,
        });
      }
      case CommandTypeAddProperty: {
        const result = wrapState(tmp, command);
        return AddPropertyEditor({
          command: result,
          ...data,
        });
      }
      case CommandTypeSetTag: {
        const result = wrapState(tmp, command);
        return SetTagEditor({
          command: result,
          ...data,
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
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { command, editorConfiguration } = props;
  const id = genId("command-section");
  const element = section({ "aria-labelledBy": id });
  renderEditor(
    element,
    command,
    id,
    () => {
      props.onRemoveCommandClick({ element, command });
    },
    editorConfiguration,
  );
  return element;
};
