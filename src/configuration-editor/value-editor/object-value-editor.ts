import van from "vanjs-core";
import * as classNames from "./object-value-editor.module.css";
import { State } from "vanjs-core";
import { button, div, input, section, label } from "../tags";
import { ObjectValue, ObjectValueItem } from "src/smith-configuration-schema";
import { deepState, genId, stateArray } from "../helpers";
import { defaultValue } from "../defaults";
import { renderValueEditor, ValueTypeEditor } from "./index";
import { HeadingWithButton } from "../containers";
import { ExpandCollapseButton } from "../components";

type OnRemoveClick = (x: {
  element: HTMLElement;
  value: State<ObjectValueItem>;
}) => void;

const ValueEditor = (props: {
  value: State<ObjectValueItem>;
  keyLabelId: string;
  onRemoveClick: OnRemoveClick;
}): HTMLElement => {
  const { onRemoveClick, keyLabelId } = props;
  const { key, value } = deepState(props.value);
  const visible = van.state(false);
  const style = van.derive(() =>
    visible.val ? "display: block" : "display: none",
  );
  const element = section(
    { "aria-labelledBy": keyLabelId, className: classNames.property },
    ExpandCollapseButton({ visible }),
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

export const ObjectValueEditor = ({ value }: { value: State<ObjectValue> }) => {
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
