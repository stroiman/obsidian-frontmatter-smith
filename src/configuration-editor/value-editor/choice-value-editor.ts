import * as classNames from "./choice-value-editor.module.css";
import van, { State } from "vanjs-core";
import { SafeChoiceValue, SafeChoiceInput } from "../../configuration-schema";
import { Setting } from "../obsidian-controls";
import { deepState, genId, stateArray } from "../helpers";
import { ChildGroup, HeadingWithButton } from "../containers";
import { CommandList } from "../value-editor";
import {
  ExpandCollapseButton,
  SimpleStateInput,
  StateInput,
} from "../components";

const { section, label, div, h4, p, button } = van.tags;

type OnRemoveClick = (x: {
  element: HTMLElement;
  choice: State<SafeChoiceValue>;
}) => void;

const Choice = (props: {
  choice: State<SafeChoiceValue>;
  onRemoveClick: OnRemoveClick;
  textLabelId: string;
  valueLabelId: string;
}) => {
  const { choice, textLabelId, valueLabelId } = props;
  const showChildren = van.state(false);
  const childCls = van.derive(() =>
    showChildren.val
      ? classNames.choiceCommands
      : classNames.choiceCommands + " " + classNames.hidden,
  );
  const { commands, text, value } = deepState(choice);
  const element = section(
    {
      "aria-label": "Option: " + choice.val.value,
      className: classNames.choiceSection,
    },
    ExpandCollapseButton({ visible: showChildren }),
    SimpleStateInput({ labelId: textLabelId, value: text }),
    SimpleStateInput({ labelId: valueLabelId, value }),
    div(
      button(
        { onclick: () => props.onRemoveClick({ element, choice }) },
        "Remove choice",
      ),
    ),
    div(
      { className: childCls },

      h4("Commands"),
      p(
        { className: "text-muted" },
        "Add additional commands that are executed if this choice is selected",
      ),
      CommandList({ commands }),
    ),
  );
  return element;
};

export const ChoiceInputConfiguration = (props: {
  value: State<SafeChoiceInput>;
}) => {
  const headingId = genId("choice-heading");
  const { prompt } = deepState(props.value);
  return section(
    { "aria-labelledBy": headingId },
    h4({ id: headingId, className: classNames.valueTypeHeading }, "Choice:"),
    div(
      { className: classNames.valueTypeDescription },
      "Provides a selection of multiple choices. Each choice can contain subsequent commands to run if that choice is selected.",
    ),
    Setting({
      name: "Prompt",
      description: "The heading of the prompt dialog",
      control: StateInput({
        type: "text",
        ["aria-label"]: "Prompt",
        value: prompt,
      }),
    }),
    Choices(props),
  );
};

const Choices = (props: { value: State<SafeChoiceInput> }) => {
  const ds = deepState(props.value);
  const options = stateArray(ds.options);
  const onRemoveClick: OnRemoveClick = ({ element, choice }) => {
    options.val = options.val.filter((x) => x !== choice);
    optionsDiv.removeChild(element);
  };
  const textLabelId = genId("option-text-label");
  const valueLabelId = genId("option-value-label");
  const optionsDiv = div(
    {
      className: classNames.optionsList,
    },
    div(),
    label({ id: textLabelId }, "Text"),
    label({ id: valueLabelId }, "Value"),
    div(),
    options.val.map((choice, i) => {
      return Choice({ choice, onRemoveClick, textLabelId, valueLabelId });
    }),
  );
  return [
    HeadingWithButton({
      name: "Choices",
      description: "",
      control: button(
        {
          onclick: (e) => {
            const choice = van.state({
              text: "Value ...",
              value: "Value ...",
              commands: [],
            });
            options.val = [...options.val, choice];
            van.add(
              optionsDiv,
              Choice({ choice, onRemoveClick, textLabelId, valueLabelId }),
            );
          },
        },
        "Add choice",
      ),
    }),
    ChildGroup(optionsDiv),
  ];
};
