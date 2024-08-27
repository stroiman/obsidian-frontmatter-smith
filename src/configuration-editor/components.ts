import van, { State } from "vanjs-core";
import { button, input } from "./tags";

export const ExpandCollapseButton = (props: {
  visible: State<boolean>;
  type: string;
}) => {
  const { visible, type } = props;
  const expandCollapseLabel = van.derive(() =>
    visible.val ? `Collapse ${type}` : `Expand ${type}`,
  );
  const expendButtonContent = van.derive(() => (visible.val ? "▼" : "▲"));
  return button(
    {
      className: "clickable-icon",
      "aria-label": expandCollapseLabel,
      onclick: () => {
        visible.val = !visible.val;
      },
    },
    expendButtonContent,
  );
};

export type StateInputProps = {
  /**
   * id of the <label> element that describes this input field
   */
  labelId: string;
  /**
   * The van state value that will be updated when you type
   */
  value: State<string>;
};

/**
 * Renders an input field that automatically updates a van state field.
 */
export const SimpleStateInput = ({ labelId, value }: StateInputProps) =>
  input({
    type: "text",
    "aria-labelledBy": labelId,
    value: value.val,
    oninput: (e) => {
      value.val = e.target.value;
    },
  });

export const StateInput = (props: any) =>
  input({
    ...props,
    value: props.value.val,
    oninput: (e) => {
      props.value.val = e.target.value;
    },
  });
