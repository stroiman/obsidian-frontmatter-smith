import * as fixtures from "./fixtures";
import { parseConfiguration } from "../src/plugin-configuration";
import { expect } from "chai";

describe("ParseConfiguration", () => {
  it("Should parse the example smith configuration", () => {
    /*
     * This will probably be removed. The first version of this plugin _only_
     * stored the configuration for the runtime behaviour.
     *
     * To accomodate more information, e.g. editor state (what is
     * collapsed/expanded), or snapshots of previous configurations, the
     * previous top-level was moved to a child of a new top-level plugin
     * configuration object.
     */
    const result = parseConfiguration(fixtures.fullConfiguration);
    expect(result).to.not.be.null;
    expect(result?.smithConfiguration.forges.length).to.equal(
      fixtures.fullConfiguration.forges.length,
    );
  });

  it("Should parse an full plugin configuration", () => {
    const fullPluginConfiguration = {
      version: "1",
      type: "plugin-config",
      smithConfiguration: fixtures.fullConfiguration,
    };
    const result = parseConfiguration(fullPluginConfiguration);
    expect(result).to.not.be.null;
    expect(result?.smithConfiguration.forges.length).to.equal(
      fixtures.fullConfiguration.forges.length,
    );
  });
});
