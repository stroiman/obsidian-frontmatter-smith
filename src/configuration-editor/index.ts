import van, { State } from "vanjs-core";
import * as classNames from "./index.module.css";
import { Setting } from "./obsidian-controls";
import { ForgeEditor } from "./forge-editor";
import { createDefaultForgeConfiguration } from "./defaults";
import { deepState, stateArray } from "./helpers";
import { PluginConfiguration } from "src/plugin-configuration";
import { ForgeConfiguration } from "src/smith-configuration-schema";

const { div, button } = van.tags;

export type OnConfigChanged = (config: PluginConfiguration) => void;

const ConfigurationEditor = (props: {
  config: PluginConfiguration;
  onConfigChanged?: OnConfigChanged;
}) => {
  const s = van.state(props.config);
  const { editorConfiguration, smithConfiguration } = deepState(s);
  const forges = stateArray(deepState(smithConfiguration).forges);
  van.derive(() => {
    const newState = s.val;
    if (newState !== s.oldVal && props.onConfigChanged) {
      props.onConfigChanged(newState);
    }
  });
  const onRemoveClick = (
    elm: HTMLElement,
    forge: State<ForgeConfiguration>,
  ) => {
    result.removeChild(elm);
    forges.val = forges.val.filter((x) => x !== forge);
    const expanded = { ...editorConfiguration.val.expanded };
    delete expanded[forge.val.$id];
    editorConfiguration.val = { ...editorConfiguration.val, expanded };
  };
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
            const forgeConfig = van.state(createDefaultForgeConfiguration());
            forges.val = [...forges.val, forgeConfig];
            van.add(
              result,
              ForgeEditor({
                forgeConfig,
                expand: true,
                editorConfiguration,
                onRemoveClick,
              }),
            );
          },
        },
        "New forge",
      ),
    }),
    ...forges.val.map((forgeConfig) =>
      ForgeEditor({ forgeConfig, editorConfiguration, onRemoveClick }),
    ),
  );
  return result;
};

export const render = (
  root: HTMLElement,
  config: PluginConfiguration,
  onConfigChanged?: OnConfigChanged,
) => {
  van.add(root, ConfigurationEditor({ config, onConfigChanged }));
};
