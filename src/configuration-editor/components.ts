import van, { State, Props } from "vanjs-core";
import { button, input } from "./tags";

export const ExpandCollapseButton = (props: {
  visible: State<boolean>;
  type: string;
  controlledContainerId: string;
}) => {
  const { visible, type, controlledContainerId } = props;
  const expandCollapseLabel = van.derive(() =>
    visible.val ? `Collapse ${type}` : `Expand ${type}`,
  );
  const expendButtonContent = van.derive(() => (visible.val ? "▼" : "▲"));
  return button(
    {
      className: "clickable-icon",
      "aria-label": expandCollapseLabel,
      "aria-expanded": visible,
      "aria-controls": controlledContainerId,
      onclick: (e) => {
        // Stop propagation as the parent _may_ also handle click. The button in
        // e.g. the forge header exists only for accessibiliy/UX reasons. You
        // can _see_ there's exapandability; and you have labels for the button
        e.stopPropagation();
        visible.val = !visible.val;
      },
    },
    expendButtonContent,
  );
};

export type StateInputProps = Props & {
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
export const SimpleStateInput = ({
  labelId,
  value,
  ...rest
}: StateInputProps) =>
  input({
    ...rest,
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
