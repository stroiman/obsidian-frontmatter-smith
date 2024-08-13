import van, { State } from "vanjs-core";
import { ChoiceValue, ChoiceInput } from "../configuration-schema";
import { Setting } from "./obsidian-controls";
import * as classNames from "./choice-value-editor.module.css";
import { genId } from "./helpers";

const { section, label, div, h4, input, hr } = van.tags;

const Choice = (props: { choice: State<ChoiceValue> }) => {
  const choice = props.choice.val;
  const textLabelId = genId("choice-text-label");
  const valueLabelId = genId("choice-value-label");
  return section(
    { "aria-label": "Option: " + choice.value },
    div(
      label({ id: textLabelId }, "Text"),
      input({
        type: "text",
        "aria-labelledBy": textLabelId,
        oninput: (e) => {
          props.choice.val = { ...choice, text: e.target.value };
        },
      }),
    ),
    div(
      label({ id: valueLabelId }, "Value"),
      input({
        type: "text",
        "aria-labelledBy": valueLabelId,
        oninput: (e) => {
          props.choice.val = { ...choice, value: e.target.value };
        },
      }),
    ),
  );
};

export const ChoiceInputConfiguration = (props: {
  value: State<ChoiceInput>;
}) => {
  const { value } = props;
  const options = value.val.options.map((x) => van.state(x));
  van.derive(() => {
    value.val = { ...value.val, options: options.map((x) => x.val) };
  });
  return div(
    h4("Choice"),
    Setting({
      name: "Prompt",
      description: "The heading of the prompt dialog",
      control: input({ type: "text" }),
    }),
    div(
      { className: classNames.valueList },
      options.map((choice, i) => {
        const c = Choice({ choice });
        return i > 0 ? [hr(), c] : c;
      }),
    ),
  );
};
