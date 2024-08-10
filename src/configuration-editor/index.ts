import van from "vanjs-core";
import {
  ForgeConfiguration,
  GlobalConfiguration,
} from "../configuration-schema";
import * as classNames from "./index.module.css";
import { Setting } from "./obsidian-controls";
import { ForgeEditor } from "./forge-editor";

const { div, form, select, option, button } = van.tags;

export type OnConfigChanged = (config: GlobalConfiguration) => void;

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
        control: form(
          { className: classNames.newForgeForm },
          select(
            option({ value: "add-to-array" }, "Add to array"),
            option({ value: "set-value" }, "Set value"),
          ),
          button(
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
        ),
      }),
      //Forges({ forges: forges.val }),
      forges.val.map((c, i) =>
        ForgeEditor({
          forgeId: i.toString(),
          forgeConfig: c,
          onChange: (c) => {
            const cp = [...forges.val];
            cp[i] = c;
            if (props.onConfigChanged) {
              props.onConfigChanged({ ...props.config, forges: cp });
            }
          },
        }),
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
