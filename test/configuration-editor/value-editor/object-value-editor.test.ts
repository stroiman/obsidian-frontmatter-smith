import { within } from "@testing-library/dom";
import { getObjectKeys } from "../dom-queries";
import { expect } from "chai";
import * as factories from "test/configuration-factories";
import { uiTest } from "../ui-test-helpers";

describe("UI / Object configuration", () => {
  const data = uiTest();

  const getCurrentSmithConfig = () => data.pluginConfig.smithConfiguration;

  beforeEach(() => {
    data.render(testConfiguration);
  });

  describe("Initial rendering", () => {
    it("Should renders two keys", () => {
      const keys = getObjectKeys(data.scope);
      expect(keys, "No of rendered keys").to.have.lengthOf(2);
    });
  });

  describe("Add new key", () => {
    beforeEach(async () => {
      await data.user.click(
        data.scope.getByRole("button", { name: "Add value" }),
      );
    });

    it("Should render another key", async () => {
      const keys = getObjectKeys(data.scope);
      expect(keys, "No of rendered keys").to.have.lengthOf(3);
    });

    it("Should update the config with a new key", () => {
      const actualConfig = getCurrentSmithConfig();
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  values: [
                    { key: "Option 1" },
                    { key: "Option 2" },
                    {
                      value: {},
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe("Remove key", () => {
    beforeEach(async () => {
      const keys = getObjectKeys(data.scope);
      await data.user.click(
        within(keys[1]).getByRole("button", { name: "Remove" }),
      );
    });

    it("Should remove the option from the UI", () => {
      const keys = getObjectKeys(data.scope);
      expect(keys).to.have.lengthOf(1);
    });

    it("Should remove the option from the config", () => {
      const actualConfig = getCurrentSmithConfig();
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  values: [{ key: "Option 1" }],
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe("Editing a key", () => {
    it("Updates the key", async () => {
      const keys = getObjectKeys(data.scope);
      const input = within(keys[0]).getByRole("textbox", { name: "Key" });
      await data.user.clear(input);
      await data.user.type(input, "new key");
      const actualConfig = getCurrentSmithConfig();
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  values: [{ key: "new key" }, { key: "Option 2" }],
                },
              },
            ],
          },
        ],
      });
    });
  });
});

const testConfiguration = factories.buildSingleForgeConfig((f) =>
  f.setName("Forge").addCommand((c) =>
    c
      .setValue()
      .setKey("key")
      .buildValue((x) =>
        x
          .objectValue()
          .addConstItem("Option 1", 123)
          .addConstItem("Option 2", 123),
      ),
  ),
);
