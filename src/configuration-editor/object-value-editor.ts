import van from "vanjs-core";
import { State } from "vanjs-core";
import { div, h4, h6, input, section } from "./tags";
import { ObjectInput, ObjectValue } from "src/configuration-schema";
import { ValueConfiguration } from "./forge-editor";

const ValueEditor = ({ value }: { value: ObjectValue }): HTMLElement => {
  return section(
    h6("Value"),
    div("Key", input({ type: "text", value: value.key })),
    div("Value", ValueConfiguration({ value: van.state(value.value) })),
  );
};

export const ObjectValueEditor = ({ value }: { value: State<ObjectInput> }) => {
  const values = value.val.values;
  return section(
    h4("Object value"),
    values.map((value) => ValueEditor({ value })),
  );
};
