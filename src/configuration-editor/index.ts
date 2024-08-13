import van from "vanjs-core";
import { GlobalConfiguration } from "../configuration-schema";
import * as classNames from "./index.module.css";
import { Setting } from "./obsidian-controls";
import { ForgeEditor } from "./forge-editor";
import { defaultValue } from "./defaults";
import { deepState, stateArray } from "./helpers";

const { div, button } = van.tags;

export type OnConfigChanged = (config: GlobalConfiguration) => void;

const ConfigurationEditor = (props: {
  config: GlobalConfiguration;
  onConfigChanged?: OnConfigChanged;
}) => {
  const s = van.state(props.config);
  const f = deepState(s).forges;
  const forges = stateArray(f);
  van.derive(() => {
    const newState = s.val;
    if (newState !== s.oldVal && props.onConfigChanged) {
      props.onConfigChanged(newState);
    }
  });
  const result = div(
    { className: classNames.forgeConfig },
    Setting({
      name: "Forges",
      description:
        'A "forge" is a set of rules for populating frontmatter. A forge can generate multiple fields, and the fields generated can depend on previous choices',
      control: button(
        {
          onclick: (e) => {
            e.preventDefault();
            const newForge = {
              name: "Forge name ...",
              commands: [
                {
                  $command: "set-value" as const,
                  key: "key",
                  value: defaultValue,
                },
              ],
            };
            const forgeConfig = van.state(newForge);
            forges.val = [...forges.val, forgeConfig];
            van.add(result, ForgeEditor({ forgeConfig }));
          },
        },
        "New forge",
      ),
    }),
    ...forges.val.map((forgeConfig) => ForgeEditor({ forgeConfig })),
  );
  return result;
};

export const render = (
  root: HTMLElement,
  config: GlobalConfiguration,
  onConfigChanged?: OnConfigChanged,
) => {
  van.add(root, ConfigurationEditor({ config, onConfigChanged }));
};
