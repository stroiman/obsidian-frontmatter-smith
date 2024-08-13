import van from "vanjs-core";
import { GlobalConfiguration } from "../configuration-schema";
import * as classNames from "./index.module.css";
import { Setting } from "./obsidian-controls";
import { ForgeEditor } from "./forge-editor";
import { defaultValue } from "./defaults";

const { div, button } = van.tags;

export type OnConfigChanged = (config: GlobalConfiguration) => void;

const ConfigurationEditor = (props: {
  config: GlobalConfiguration;
  onConfigChanged?: OnConfigChanged;
}) => {
  const forges = [...props.config.forges];
  const count = van.state(0);
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
            forges.push(newForge);
            count.val++;
            const i = forges.length - 1;
            const forgeConfig = van.state(newForge);
            van.derive(() => {
              const cp = [...forges];
              cp[i] = forgeConfig.val;
              if (
                props.onConfigChanged &&
                forgeConfig.val !== forgeConfig.oldVal
              ) {
                props.onConfigChanged({ ...props.config, forges: cp });
              }
            });
            van.add(result, ForgeEditor({ forgeConfig }));
          },
        },
        "New forge",
      ),
    }),
    ...forges.map((c, i) => {
      const forgeConfig = van.state(c);
      van.derive(() => {
        const cp = [...forges];
        cp[i] = forgeConfig.val;
        if (props.onConfigChanged && forgeConfig.val !== forgeConfig.oldVal) {
          props.onConfigChanged({ ...props.config, forges: cp });
        }
      });
      return ForgeEditor({ forgeConfig });
    }),
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
