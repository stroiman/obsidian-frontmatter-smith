import van from "vanjs-core";
import { State } from "vanjs-core";
import { button, div, h4, h6, input, section } from "./tags";
import { ObjectInput, ObjectValue } from "src/configuration-schema";
import { ValueConfiguration } from "./forge-editor";
import { genId } from "./helpers";
import { defaultValue } from "./defaults";

type OnRemoveClick = (x: { element: HTMLElement; value: ObjectValue }) => void;

const ValueEditor = ({
  value,
  onRemoveClick,
}: {
  value: ObjectValue;
  onRemoveClick: OnRemoveClick;
}): HTMLElement => {
  const id = genId("object-key");
  const element = section(
    { "aria-labelledBy": id },
    h6({ id }, "Object key"),
    button(
      {
        onclick: () => {
          onRemoveClick({ element, value });
        },
      },
      "Remove",
    ),
    div("Key", input({ type: "text", value: value.key })),
    div("Value", ValueConfiguration({ value: van.state(value.value) })),
  );
  return element;
};

export const ObjectValueEditor = ({ value }: { value: State<ObjectInput> }) => {
  const values = van.state(value.val.values);
  van.derive(() => (value.val = { ...value.val, values: values.val }));
  const onRemoveClick: OnRemoveClick = ({ element, value }) => {
    values.val = values.val.filter((x) => x !== value);
    result.removeChild(element);
  };
  const result = section(
    h4("Object value"),
    button(
      {
        onclick: () => {
          const value: ObjectValue = {
            key: "key ...",
            value: defaultValue,
          };
          values.val = [...values.val, value];
          van.add(result, ValueEditor({ value, onRemoveClick }));
        },
      },
      "Add value",
    ),
    values.val.map((value) => ValueEditor({ value, onRemoveClick })),
  );
  return result;
};
