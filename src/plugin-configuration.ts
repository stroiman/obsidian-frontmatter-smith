import * as t from "io-ts";
import {
  SmithConfiguration,
  smithConfiguration,
} from "./smith-configuration-schema";

const pluginConfiguration = t.type({
  version: t.literal("1"),
  type: t.literal("plugin-config"),
  smithConfiguration,
});

const possibleRootConfig = t.union([pluginConfiguration, smithConfiguration]);

type PluginConfiguration = t.TypeOf<typeof pluginConfiguration>;

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
