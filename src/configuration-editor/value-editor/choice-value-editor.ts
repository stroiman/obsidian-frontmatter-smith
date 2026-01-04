import * as classNames from "./choice-value-editor.module.css";
import van, { State } from "vanjs-core";
import { ChoiceValue, ChoiceValueItem } from "../../smith-configuration-schema";
import { Setting } from "../obsidian-controls";
import { deepState, genId, stateArray } from "../helpers";
import { ChildGroup, HeadingWithButton } from "../containers";
import { CommandList } from "../value-editor";
import {
  ExpandCollapseButton,
  SimpleStateInput,
  StateInput,
} from "../components";
import { createDefaultChoiceValueItem } from "../defaults";
import { EditorConfigWrapper } from "../types";
import { DragHandle, initSortable, OptionsContainer } from "../sortable";

const { section, label, div, h4, p, button } = van.tags;

type OnRemoveClick = (x: {
  element: HTMLElement;
  choice: State<ChoiceValueItem>;
}) => void;

const Choice = (props: {
  choice: State<ChoiceValueItem>;
  onRemoveClick: OnRemoveClick;
  textLabelId: string;
  valueLabelId: string;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { choice, textLabelId, valueLabelId, editorConfiguration } = props;
  const showChildren = editorConfiguration.visible(choice.val.$id);
  const childCls = van.derive(() =>
    showChildren.val
      ? classNames.choiceCommands
      : classNames.choiceCommands + " " + classNames.hidden,
  );
  const { commands, text, value } = deepState(choice);
  const optionContainerId = genId("option-container");
  const element = section(
    {
      "aria-label": "Option: " + choice.val.value,
    },
    div(
      { className: classNames.optionRow },
      div(
        {
          className: classNames.optionRowHead,
        },
        DragHandle(),
        ExpandCollapseButton({
          visible: showChildren,
          type: "choice",
          controlledContainerId: optionContainerId,
        }),
      ),
      div(
        { className: classNames.optionRowInputs },
        SimpleStateInput({
          className: classNames.optionRowInput,
          labelId: textLabelId,
          value: text,
        }),
        SimpleStateInput({
          className: classNames.optionRowInput,
          labelId: valueLabelId,
          value,
        }),
      ),
      button(
        {
          className: classNames.optionRowFoot,
          onclick: () => props.onRemoveClick({ element, choice }),
        },
        "Remove choice",
      ),
    ),
    div(
      {
        id: optionContainerId,
        className: childCls,
        style: "margin-left: 2rem",
      },

      h4("Commands"),
      p(
        { className: "text-muted" },
        "Add additional commands that are executed if this choice is selected",
      ),
      CommandList({ commands, editorConfiguration }),
    ),
  );
  return element;
};

export const ChoiceInputConfiguration = (props: {
  value: State<ChoiceValue>;
  editorConfiguration: EditorConfigWrapper;
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

const Choices = (props: {
  value: State<ChoiceValue>;
  editorConfiguration: EditorConfigWrapper;
}) => {
  const { editorConfiguration } = props;
  const ds = deepState(props.value);
  const options = stateArray(ds.options);
  const onRemoveClick: OnRemoveClick = ({ element, choice }) => {
    options.val = options.val.filter((x) => x !== choice);
    optionsDiv.removeChild(element);
  };
  const textLabelId = genId("option-text-label");
  const valueLabelId = genId("option-value-label");
  const optionsDiv = OptionsContainer(
    options.val.map((choice, i) => {
      return Choice({
        choice,
        onRemoveClick,
        textLabelId,
        valueLabelId,
        editorConfiguration,
      });
    }),
  );
  initSortable(optionsDiv, options);
  const result = div(
    { className: classNames.optionsList },
    div(
      {
        className: classNames.optionRow,
      },
      div({ className: classNames.optionRowHead }),
      div(
        {
          className: classNames.optionRowInputs,
        },
        label(
          { id: textLabelId, className: classNames.optionRowInput },
          "Text",
        ),
        label(
          { id: valueLabelId, className: classNames.optionRowInput },
          "Value",
        ),
      ),
      div({ className: classNames.optionRowFoot }),
    ),
    optionsDiv,
  );
  return [
    HeadingWithButton({
      name: "Choices",
      description:
        "Hint: To add new commands on selecting a value, expand the value to see the options. This will improved in a future version",
      control: button(
        {
          onclick: (e) => {
            const choice = van.state(createDefaultChoiceValueItem());
            options.val = [...options.val, choice];
            van.add(
              optionsDiv,
              Choice({
                choice,
                onRemoveClick,
                textLabelId,
                valueLabelId,
                editorConfiguration,
              }),
            );
          },
        },
        "Add choice",
      ),
    }),
    ChildGroup(result),
  ];
};
