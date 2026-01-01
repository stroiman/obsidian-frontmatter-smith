import { expect } from "chai";
import {
  isConfigurationValid,
  parseConfiguration,
} from "src/smith-configuration-schema";
import { fullConfiguration } from "./fixtures";

describe("Configuration schema", () => {
  it("Should be able to load the example config", () => {
    expect(isConfigurationValid(fullConfiguration)).to.be.true;
  });

  describe("Migration", () => {
    it("Parses config with 'add-property' command", () => {
      const config = parseConfiguration(configWithStringAddProperty);
      expect(config?.forges[0].commands[0]).to.haveOwnProperty("key");
    });
  });
});

const configWithStringAddProperty = {
  version: "1",
  forges: [
    {
      $id: "HiNRIpyO1pOdKabm4jKP9",
      name: "Forge name ...",
      commands: [
        {
          $id: "Fd_MLqgDxXKuRx2o4ivM9",
          $command: "add-property",
          key: "prop",
        },
      ],
    },
  ],
};
