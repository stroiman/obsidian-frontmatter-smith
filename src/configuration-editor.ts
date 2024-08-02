import van from "vanjs-core";
import {
  ForgeConfiguration,
  GlobalConfiguration,
} from "./configuration-schema";
const { div, h3 } = van.tags;
import classes from "./configuration-editor.module.css";

const ForgeEditor = ({ forgeConfig }: { forgeConfig: ForgeConfiguration }) =>
  div({ className: classes["forge-config-block"] }, h3(forgeConfig.name));

const ConfigurationEditor = (props: { config: GlobalConfiguration }) => {
  const forges = props.config.forges;
  return div(
    { className: classes["forge-config"] },
    forges.map((forgeConfig) => ForgeEditor({ forgeConfig })),
  );
};

export const render = (root: HTMLElement, config: GlobalConfiguration) => {
  van.add(root, ConfigurationEditor({ config }));
};
