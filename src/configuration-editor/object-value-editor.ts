import van from "vanjs-core";
import { State } from "vanjs-core";
import { button, div, h4, h6, input, section } from "./tags";
import { ObjectInput, ObjectValue } from "src/configuration-schema";
import { ValueConfiguration } from "./forge-editor";
import { genId } from "./helpers";
import { defaultValue } from "./defaults";

const ValueEditor = ({ value }: { value: ObjectValue }): HTMLElement => {
  const id = genId("object-key");
  return section(
    { "aria-labelledBy": id },
    h6({ id }, "Object key"),
    div("Key", input({ type: "text", value: value.key })),
    div("Value", ValueConfiguration({ value: van.state(value.value) })),
  );
};

export const ObjectValueEditor = ({ value }: { value: State<ObjectInput> }) => {
  const values = van.state(value.val.values);
  van.derive(() => (value.val = { ...value.val, values: values.val }));
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
          van.add(result, ValueEditor({ value }));
        },
      },
      "Add value",
    ),
    values.val.map((value) => ValueEditor({ value })),
  );
  return result;
};
