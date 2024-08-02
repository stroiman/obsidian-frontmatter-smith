import van from "vanjs-core";
import {
  ForgeConfiguration,
  GlobalConfiguration,
} from "./configuration-schema";
const { div, h3 } = van.tags;
import * as classNames from "./configuration-editor.module.css";

const ForgeEditor = ({ forgeConfig }: { forgeConfig: ForgeConfiguration }) =>
  div({ className: classNames.forgeConfigBlock }, h3(forgeConfig.name));

const ConfigurationEditor = (props: { config: GlobalConfiguration }) => {
  const forges = props.config.forges;
  return div(
    { className: classNames.forgeConfig },
    forges.map((c) => ForgeEditor({ forgeConfig: c })),
  );
};

export const render = (root: HTMLElement, config: GlobalConfiguration) => {
  van.add(root, ConfigurationEditor({ config }));
};
