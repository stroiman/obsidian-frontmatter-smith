import van from "vanjs-core";
import clsx from "clsx";
import * as classNames from "./object-value-editor.module.css";
import { State } from "vanjs-core";
import { button, div, input, section, label } from "../tags";
import { ObjectInput, ObjectValue } from "src/configuration-schema";
import { deepState, genId, stateArray } from "../helpers";
import { defaultValue } from "../defaults";
import { renderValueEditor, ValueTypeEditor } from "./index";
import { HeadingWithButton } from "../containers";

type OnRemoveClick = (x: {
  element: HTMLElement;
  value: State<ObjectValue>;
}) => void;

const ValueEditor = (props: {
  value: State<ObjectValue>;
  keyLabelId: string;
  onRemoveClick: OnRemoveClick;
}): HTMLElement => {
  const { onRemoveClick, keyLabelId } = props;
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
    { "aria-labelledBy": keyLabelId, className: classNames.property },
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
  const keyLabelId = genId("attribute-label");
  const items = div(
    { className: classNames.propertyList },
    div(),
    label({ id: keyLabelId }, "Object key"),
    div("Value"),
    div(),
    values.val.map((value) =>
      ValueEditor({ value, onRemoveClick, keyLabelId }),
    ),
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
            van.add(items, ValueEditor({ value, keyLabelId, onRemoveClick }));
          },
        },
        "Add value",
      ),
    }),
    items,
  );
};
