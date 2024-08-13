import van, { State } from "vanjs-core";
import { ChoiceValue, ChoiceInput } from "../configuration-schema";
import { Setting } from "./obsidian-controls";
import * as classNames from "./choice-value-editor.module.css";

const { div, h4, input, p, hr } = van.tags;

const Choice = (props: { choice: ChoiceValue }) => {
  const { choice } = props;
  return div(p("Text: ", choice.text), p("Value: ", choice.value));
};

export const ChoiceInputConfiguration = (props: {
  value: State<ChoiceInput>;
}) => {
  const { value } = props;
  return div(
    h4("Choice"),
    Setting({
      name: "Prompt",
      description: "The heading of the prompt dialog",
      control: input({ type: "text" }),
    }),
    div(
      { className: classNames.valueList },
      value.val.options.map((choice, i) => {
        const c = Choice({ choice });
        return i > 0 ? [hr(), c] : c;
      }),
    ),
  );
};
