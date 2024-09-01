import van, { State } from "vanjs-core";
import { ForgeConfiguration } from "../../smith-configuration-schema";

import * as classNames from "./index.module.css";
import { Setting } from "../obsidian-controls";
import { deepState, deepState2way, genId } from "../helpers";
import { CommandList } from "../value-editor";
import { button, div } from "../tags";
import { ExpandCollapseButton } from "../components";
import { EditorConfigWrapper } from "../types";

const clsx = (...args: any[]): string => {
  return args
    .reduce((p, c) => (typeof c === "string" ? p + " " + c : p), "")
    .trim();
};

const { section, h3, input } = van.tags;

export function ForgeEditor(props: {
  forgeConfig: State<ForgeConfiguration>;
  expand?: boolean;
  editorConfiguration: EditorConfigWrapper;
  onRemoveClick: (
    elm: HTMLElement,
    forgeConfig: State<ForgeConfiguration>,
  ) => void;
}) {
  const { forgeConfig, expand, editorConfiguration } = props;
  const { expanded } = deepState2way(editorConfiguration);
  const id = genId("forge-config-heading");
  const $id = forgeConfig.val.$id;
  const { name, commands } = deepState(forgeConfig);
  const defaultVisible =
    expand || editorConfiguration.val.expanded[$id] || false;
  const visible = van.state(defaultVisible);
  const forgeContainerId = genId("forge-container");
  van.derive(() => {
    const newVal = visible.val;
    if (newVal != visible.oldVal) {
      expanded.val = { ...expanded.val, [$id]: newVal };
    }
  });
  const elm = section(
    {
      className: classNames.forgeConfigBlock,
      ["aria-labelledBy"]: id,
    },
    div(
      {
        className: classNames.forgeConfigHeader,
        onclick: () => {
          visible.val = !visible.val;
        },
      },
      ExpandCollapseButton({
        visible,
        type: "Forge",
        controlledContainerId: forgeContainerId,
      }),
      h3(
        {
          id,
          className: classNames.forgeConfigHeading,
          ["aria-label"]: `Forge: ${name.val}`,
        },
        name,
      ),
      button(
        {
          onclick: (e) => {
            e.stopPropagation();
            props.onRemoveClick(elm, props.forgeConfig);
          },
          ["aria-label"]: "Remove forge",
        },
        "Remove",
      ),
    ),
    div(
      {
        id: forgeContainerId,
        className: () =>
          clsx(
            classNames.forgeConfigCommands,
            !visible.val && classNames.hidden,
          ),
      },
      Setting({
        name: "Forge name",
        control: input({
          type: "text",
          value: name.val,
          "aria-label": "Forge name",
          oninput: (e) => {
            name.val = e.target.value;
          },
        }),
      }),
      CommandList({ commands, editorConfiguration }),
    ),
  );
  return elm;
}
