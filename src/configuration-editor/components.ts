import van, { State } from "vanjs-core";
import { button } from "./tags";

export const ExpandCollapseButton = (props: { visible: State<boolean> }) => {
  const { visible } = props;
  const expandCollapseLabel = van.derive(() =>
    visible.val ? "Collapse value editor" : "Expend value editor",
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
