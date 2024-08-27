import * as t from "io-ts";
import {
  emptySmithConfiguration,
  SmithConfiguration,
  smithConfiguration,
} from "./smith-configuration-schema";

const pluginConfiguration = t.type({
  version: t.literal("1"),
  type: t.literal("plugin-config"),
  smithConfiguration,
});

const possibleRootConfig = t.union([pluginConfiguration, smithConfiguration]);

export type PluginConfiguration = t.TypeOf<typeof pluginConfiguration>;

export const defaultConfiguration: PluginConfiguration = {
  version: "1",
  type: "plugin-config",
  smithConfiguration: emptySmithConfiguration,
};

const createPluginConfigFromSmithConfig = (
  smithConfiguration: SmithConfiguration,
): PluginConfiguration => ({
  version: "1" as const,
  type: "plugin-config",
  smithConfiguration,
});

export const parseConfiguration = (
  input: unknown,
): PluginConfiguration | null => {
  const result = possibleRootConfig.decode(input);
  switch (result._tag) {
    case "Left":
      return null;
    case "Right": {
      const config = result.right;
      return "forges" in config
        ? createPluginConfigFromSmithConfig(config)
        : config;
    }
  }
  throw new Error("Should not have arrived here");
};

export const parseConfigurationOrDefault = (
  input: unknown,
): PluginConfiguration => {
  return parseConfiguration(input) || defaultConfiguration;
};
