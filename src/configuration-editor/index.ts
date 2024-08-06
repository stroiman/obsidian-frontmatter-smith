import van from "vanjs-core";
import { GlobalConfiguration } from "../configuration-schema";
import * as classNames from "./index.module.css";
import { Setting } from "./obsidian-controls";
import { ForgeEditor } from "./forge-editor";

const { div, button } = van.tags;

const ConfigurationEditor = (props: { config: GlobalConfiguration }) => {
  const forges = props.config.forges;
  return div(
    { className: classNames.forgeConfig },
    Setting({
      name: "Forges",
      description:
        'A "forge" is a set of rules for populating frontmatter. A forge can generate multiple fields, and the fields generated can depend on previous choices',
      control: button("New forge"),
    }),
    forges.map((c, i) =>
      ForgeEditor({ forgeId: i.toString(), forgeConfig: c }),
    ),
  );
};

export const render = (root: HTMLElement, config: GlobalConfiguration) => {
  van.add(root, ConfigurationEditor({ config }));
};
