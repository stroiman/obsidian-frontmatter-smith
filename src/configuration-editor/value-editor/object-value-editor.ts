import van from "vanjs-core";
import clsx from "clsx";
import * as classNames from "./object-value-editor.module.css";
import { State } from "vanjs-core";
import { button, div, h6, input, section } from "../tags";
import { ObjectInput, ObjectValue } from "src/configuration-schema";
import { deepState, genId, stateArray } from "../helpers";
import { defaultValue } from "../defaults";
import { ValueConfiguration } from "./index";
import { HeadingWithButton } from "../containers";

type OnRemoveClick = (x: {
  element: HTMLElement;
  value: State<ObjectValue>;
}) => void;

const ValueEditor = ({
  value,
  onRemoveClick,
}: {
  value: State<ObjectValue>;
  onRemoveClick: OnRemoveClick;
}): HTMLElement => {
  const showValue = van.state(false);
  const style = van.derive(() =>
    showValue.val ? "display: block" : "display: none",
  );
  const expandCollapseLabel = van.derive(() =>
    showValue.val ? "Collapse value editor" : "Expend value editor",
  );
  const expendButtonContent = van.derive(() => (showValue.val ? "▼" : "▲"));
  const id = genId("object-key");
  const element = section(
    { "aria-labelledBy": id, className: classNames.property },
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
    div(
      h6({ id }, "Object key"),
      "Key",
      input({
        type: "text",
        value: value.val.key,
        "aria-label": "Key",
        oninput: (e) => {
          value.val = { ...value.val, key: e.target.value };
        },
      }),
    ),
    button(
      {
        onclick: () => {
          onRemoveClick({ element, value });
        },
      },
      "Remove",
    ),
    div(
      { className: classNames.propertyValue, style },
      "Value",
      ValueConfiguration({ value: van.state(value.val.value) }),
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
