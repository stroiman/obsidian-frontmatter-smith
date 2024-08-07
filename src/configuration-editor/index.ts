import van from "vanjs-core";
import {
  ForgeConfiguration,
  GlobalConfiguration,
} from "../configuration-schema";
import * as classNames from "./index.module.css";
import { Setting } from "./obsidian-controls";
import { ForgeEditor } from "./forge-editor";

const { div, button } = van.tags;

export type OnConfigChanged = (config: GlobalConfiguration) => void;

const Forges = (props: { forges: ForgeConfiguration[] }) => {
  return props.forges.map((c, i) =>
    ForgeEditor({ forgeId: i.toString(), forgeConfig: c }),
  );
};

const ConfigurationEditor = (props: {
  config: GlobalConfiguration;
  onConfigChanged?: OnConfigChanged;
}) => {
  const forges = van.state(props.config.forges);
  van.derive(() => {
    props.onConfigChanged &&
      props.onConfigChanged({
        ...props.config,
        forges: forges.val,
      });
  });
  const count = van.state(0);
  return () =>
    div(
      { className: classNames.forgeConfig },
      Setting({
        name: "Forges",
        description:
          'A "forge" is a set of rules for populating frontmatter. A forge can generate multiple fields, and the fields generated can depend on previous choices',
        control: button(
          {
            onclick: () => {
              forges.val = [
                ...forges.val,
                { name: "New forge ...", commands: [] },
              ];
              count.val++;
            },
          },
          "New forge",
        ),
      }),
      //Forges({ forges: forges.val }),
      forges.val.map((c, i) =>
        ForgeEditor({ forgeId: i.toString(), forgeConfig: c }),
      ),
    );
};

export const render = (
  root: HTMLElement,
  config: GlobalConfiguration,
  onConfigChanged?: OnConfigChanged,
) => {
  van.add(root, ConfigurationEditor({ config, onConfigChanged }));
};
