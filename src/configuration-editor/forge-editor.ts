import van, { State } from "vanjs-core";
import { ForgeConfiguration } from "../configuration-schema";

import * as classNames from "./forge-editor.module.css";
import { Setting } from "./obsidian-controls";
import { deepState, genId } from "./helpers";
import { CommandList } from "./value-editor";

const { section, h3, input } = van.tags;

export function ForgeEditor(props: { forgeConfig: State<ForgeConfiguration> }) {
  const id = genId("forge-config-heading");
  const { name, commands } = deepState(props.forgeConfig);
  return section(
    {
      className: classNames.forgeConfigBlock,
      ["aria-labelledBy"]: id,
    },
    h3(
      {
        id,
        className: classNames.forgeConfigHeading,
        ["aria-label"]: `Forge: ${name.val}`,
      },
      name,
    ),
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
  );
}
