import van from "vanjs-core";
import clsx from "clsx";
import * as classNames from "./object-value-editor.module.css";
import { State } from "vanjs-core";
import { button, div, input, section } from "../tags";
import { ObjectInput, ObjectValue } from "src/configuration-schema";
import { deepState, stateArray } from "../helpers";
import { defaultValue } from "../defaults";
import { renderValueEditor, ValueTypeEditor } from "./index";
import { HeadingWithButton } from "../containers";

type OnRemoveClick = (x: {
  element: HTMLElement;
  value: State<ObjectValue>;
}) => void;

const ValueEditor = (props: {
  value: State<ObjectValue>;
  onRemoveClick: OnRemoveClick;
}): HTMLElement => {
  const { onRemoveClick } = props;
  const { key, value } = deepState(props.value);
  const showValue = van.state(false);
  const style = van.derive(() =>
    showValue.val ? "display: block" : "display: none",
  );
  const expandCollapseLabel = van.derive(() =>
    showValue.val ? "Collapse value editor" : "Expend value editor",
  );
  const expendButtonContent = van.derive(() => (showValue.val ? "▼" : "▲"));
  const element = section(
    { "aria-label": "Object key", className: classNames.property },
    button(
      {
        className: clsx(classNames.collapseButton, "clickable-icon"),
        "aria-label": expandCollapseLabel,
        onclick: () => {
          showValue.val = !showValue.val;
        },
      },
      expendButtonContent,
    ),
    input({
      type: "text",
      value: key.val,
      "aria-label": "Key",
      oninput: (e) => {
        key.val = e.target.value;
      },
    }),
    ValueTypeEditor({ value }),
    button(
      {
        onclick: () => {
          onRemoveClick({ element, value: props.value });
        },
      },
      "Remove",
    ),
    renderValueEditor(
      div({ className: classNames.propertyValue, style }),
      value,
    ),
  );
  return element;
};

export const ObjectValueEditor = ({ value }: { value: State<ObjectInput> }) => {
  const values = stateArray(deepState(value).values);
  const onRemoveClick: OnRemoveClick = ({ element, value }) => {
    values.val = values.val.filter((x) => x !== value);
    items.removeChild(element);
  };
  const items = div(
    { className: classNames.propertyList },
    div(),
    div("Object key"),
    div("Value"),
    div(),
    values.val.map((value) => ValueEditor({ value, onRemoveClick })),
  );
  return section(
    HeadingWithButton({
      name: "Object value",
      description: "",
      control: button(
        {
          onclick: () => {
            const value = van.state({
              key: "key ...",
              value: defaultValue,
            });
            values.val = [...values.val, value];
            van.add(items, ValueEditor({ value, onRemoveClick }));
          },
        },
        "Add value",
      ),
    }),
    items,
  );
};
