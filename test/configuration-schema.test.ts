import { expect } from "chai";
import { isConfigurationValid } from "src/smith-configuration-schema";
import { fullConfiguration } from "./fixtures";

describe("Configuration schema", () => {
  it("Should be able to load the example config", () => {
    expect(isConfigurationValid(fullConfiguration)).to.be.true;
  });
});
