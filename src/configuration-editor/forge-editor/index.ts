import van, { State } from "vanjs-core";
import { ForgeConfiguration } from "../../configuration-schema";

import * as classNames from "./index.module.css";
import { Setting } from "../obsidian-controls";
import { deepState, genId } from "../helpers";
import { CommandList } from "../value-editor";
import { div } from "../tags";
import { ExpandCollapseButton } from "../components";
import clsx from "clsx";

const { section, h3, input } = van.tags;

export function ForgeEditor(props: {
  forgeConfig: State<ForgeConfiguration>;
  expand?: boolean;
}) {
  const id = genId("forge-config-heading");
  const { name, commands } = deepState(props.forgeConfig);
  const visible = van.state(props.expand || false);
  return section(
    {
      className: classNames.forgeConfigBlock,
      ["aria-labelledBy"]: id,
    },
    div(
      { className: classNames.forgeConfigHeader },
      ExpandCollapseButton({ visible }),
      h3(
        {
          id,
          className: classNames.forgeConfigHeading,
          ["aria-label"]: `Forge: ${name.val}`,
        },
        name,
      ),
    ),
    div(
      {
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
      CommandList({ commands }),
    ),
  );
}
