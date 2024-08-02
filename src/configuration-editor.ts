import van from "vanjs-core";
import {
  ForgeConfiguration,
  GlobalConfiguration,
} from "./configuration-schema";
const { div, h3 } = van.tags;

const ForgeEditor = ({ forgeConfig }: { forgeConfig: ForgeConfiguration }) =>
  div({ className: "forge-config-block" }, h3(forgeConfig.name));

const ConfigurationEditor = (props: { config: GlobalConfiguration }) => {
  const forges = props.config.forges;
  return div(
    { className: "forge-config" },
    forges.map((forgeConfig) => ForgeEditor({ forgeConfig })),
  );
};

export const render = (root: HTMLElement, config: GlobalConfiguration) => {
  van.add(root, ConfigurationEditor({ config }));
};
