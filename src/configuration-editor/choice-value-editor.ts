import van, { State } from "vanjs-core";
import { ChoiceValue, ChoiceInput } from "../configuration-schema";
import { Setting } from "./obsidian-controls";
import * as classNames from "./choice-value-editor.module.css";
import { genId } from "./helpers";

const { section, label, div, h4, input, hr, button } = van.tags;

const Choice = (props: { choice: State<ChoiceValue> }) => {
  const { choice } = props;
  const textLabelId = genId("choice-text-label");
  const valueLabelId = genId("choice-value-label");
  return section(
    { "aria-label": "Option: " + choice.val.value },
    div(
      label({ id: textLabelId }, "Text"),
      input({
        type: "text",
        "aria-labelledBy": textLabelId,
        value: choice.val.text,
        oninput: (e) => {
          props.choice.val = { ...choice.val, text: e.target.value };
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
          props.choice.val = { ...choice.val, value: e.target.value };
        },
      }),
    ),
  );
};

export const ChoiceInputConfiguration = (props: {
  value: State<ChoiceInput>;
}) => {
  const { value } = props;
  const options = van.state(
    value.val.options.map((option) => van.state(option)),
  );
  van.derive(
    () =>
      (value.val = {
        ...value.val,
        options: options.val.map((option) => option.val),
      }),
  );
  const optionsDiv = div(
    { className: classNames.valueList },
    options.val.map((choice, i) => {
      const c = Choice({ choice });
      return i > 0 ? [hr(), c] : c;
    }),
  );
  return div(
    h4("Choice"),
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
          });
          options.val = [...options.val, choice];
          const addHr = options.val.length > 1;
          van.add(optionsDiv, [addHr ? hr() : [], Choice({ choice })]);
        },
      },
      "Add choice",
    ),
    optionsDiv,
  );
};
