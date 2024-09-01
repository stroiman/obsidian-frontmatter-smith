import van from "vanjs-core";
import * as classNames from "./object-value-editor.module.css";
import { State } from "vanjs-core";
import { button, div, input, section, label } from "../tags";
import { ObjectValue, ObjectValueItem } from "src/smith-configuration-schema";
import { deepState, genId, stateArray } from "../helpers";
import { createDefaultObjectValueItem } from "../defaults";
import { renderValueEditor, ValueTypeEditor } from "./index";
import { HeadingWithButton } from "../containers";
import { ExpandCollapseButton } from "../components";
import { EditorConfigWrapper } from "../types";

type OnRemoveClick = (x: {
  element: HTMLElement;
  value: State<ObjectValueItem>;
}) => void;

const ValueEditor = (props: {
  value: State<ObjectValueItem>;
  keyLabelId: string;
  onRemoveClick: OnRemoveClick;
  expanded?: boolean;
  editorConfiguration: EditorConfigWrapper;
}): HTMLElement => {
  const { onRemoveClick, keyLabelId, expanded, editorConfiguration } = props;
  const id = props.value.val.$id;
  const { key, value } = deepState(props.value);
  const visible = van.state(
    expanded || editorConfiguration.val.expanded[id] || false,
  );
  const valueType = van.derive(() => value.val.$type);
  van.derive(() => {
    const val = valueType.val;
    if (val !== valueType.oldVal) {
      visible.val = true;
      editorConfiguration.setExpanded(id, true);
    }
  });
  const style = van.derive(() => {
    const val = visible.val;
    return val ? "display: block" : "display: none";
  });
  const valueContainerId = genId("value-container");
  const element = section(
    { "aria-labelledBy": keyLabelId, className: classNames.property },
    ExpandCollapseButton({
      visible,
      type: "value editor",
      controlledContainerId: valueContainerId,
    }),
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
      div({ id: valueContainerId, className: classNames.propertyValue, style }),
      value,
      editorConfiguration,
    ),
  );
  return element;
};

export const ObjectValueEditor = ({
  value,
  editorConfiguration,
}: {
  value: State<ObjectValue>;
  editorConfiguration: EditorConfigWrapper;
}) => {
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
      ValueEditor({ value, onRemoveClick, keyLabelId, editorConfiguration }),
    ),
  );
  return section(
    HeadingWithButton({
      name: "Object value",
      description:
        "Hint: Remember to expand each choice after creating it to allow editing the value configuration. This will be improved in a future version",
      control: button(
        {
          onclick: () => {
            const value = van.state(createDefaultObjectValueItem());
            values.val = [...values.val, value];
            van.add(
              items,
              ValueEditor({
                value,
                keyLabelId,
                onRemoveClick,
                expanded: true,
                editorConfiguration,
              }),
            );
          },
        },
        "Add value",
      ),
    }),
    items,
  );
};
