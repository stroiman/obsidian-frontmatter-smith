import van, { State } from "vanjs-core";
import { SafeChoiceValue, SafeChoiceInput } from "../configuration-schema";
import { Setting } from "./obsidian-controls";
import { deepState, genId, stateArray } from "./helpers";
import { CommandList } from "./forge-editor";
import { ChildGroup } from "./containers";

const { section, label, div, h4, input, p, button } = van.tags;

type OnRemoveClick = (x: {
  element: HTMLElement;
  choice: State<SafeChoiceValue>;
}) => void;

const Choice = (props: {
  choice: State<SafeChoiceValue>;
  onRemoveClick: OnRemoveClick;
}) => {
  const { choice } = props;
  const textLabelId = genId("choice-text-label");
  const valueLabelId = genId("choice-value-label");
  const { commands, text, value } = deepState(choice);
  const element = section(
    { "aria-label": "Option: " + choice.val.value },
    button(
      { onclick: () => props.onRemoveClick({ element, choice }) },
      "Remove choice",
    ),
    div(
      label({ id: textLabelId }, "Text"),
      input({
        type: "text",
        "aria-labelledBy": textLabelId,
        value: choice.val.text,
        oninput: (e) => {
          text.val = e.target.value;
        },
      }),
    ),
    div(
      label({ id: valueLabelId }, "Value"),
      input({
        type: "text",
        value: choice.val.value,
        "aria-labelledBy": valueLabelId,
        oninput: (e) => {
          value.val = e.target.value;
        },
      }),
    ),
    h4("Commands"),
    p(
      { className: "text-muted" },
      "Add additional commands that are executed if this choice is selected",
    ),
    CommandList({ commands }),
  );
  return element;
};

export const ChoiceInputConfiguration = (props: {
  value: State<SafeChoiceInput>;
}) => {
  const ds = deepState(props.value);
  const options = stateArray(ds.options);
  const onRemoveClick: OnRemoveClick = ({ element, choice }) => {
    options.val = options.val.filter((x) => x !== choice);
    optionsDiv.removeChild(element);
  };
  const optionsDiv = ChildGroup(
    options.val.map((choice, i) => {
      return Choice({ choice, onRemoveClick });
    }),
  );
  const headingId = genId("choice-heading");
  return section(
    { "aria-labelledBy": headingId },
    h4({ id: headingId }, "Choice:"),
    Setting({
      name: "Prompt",
      description: "The heading of the prompt dialog",
      control: input({ type: "text" }),
    }),
    button(
      {
        onclick: (e) => {
          const choice = van.state({
            text: "Value ...",
            value: "Value ...",
            commands: [],
          });
          options.val = [...options.val, choice];
          van.add(optionsDiv, Choice({ choice, onRemoveClick }));
        },
      },
      "Add choice",
    ),
    optionsDiv,
  );
};
