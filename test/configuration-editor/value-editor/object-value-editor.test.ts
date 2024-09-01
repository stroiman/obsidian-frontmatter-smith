import { within } from "@testing-library/dom";
import { getObjectKeys } from "../dom-queries";
import { expect } from "chai";
import * as factories from "test/configuration-factories";
import { getExpandCollapseButton, uiTest } from "../ui-test-helpers";

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

    it("Should expand the new key", async () => {
      const keys = getObjectKeys(data.scope);
      expect(getExpandCollapseButton(within(keys.at(-1)!))).to.have.attribute(
        "aria-expanded",
        "true",
      );
    });

    it("Should collapse the new key on reload", () => {
      // I don't know if this is _sensible_ behaviour, but it is _current_
      // behaviour. It does seem to make sense from a point of view. This may
      // be inconsistent with when you expand an existing key, it remembers its
      // open state.
      //
      // If you create a new value, and configure it, we hope that it's correct.
      //
      // If you expand an existing key to edit, it's because this is causing
      // some issues, and you are debuggin this. Therefore we want to keep it
      // open.
      data.rerender();
      const keys = getObjectKeys(data.scope);
      expect(getExpandCollapseButton(within(keys.at(-1)!))).to.have.attribute(
        "aria-expanded",
        "false",
      );
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

  describe("Editing an existing configuration", () => {
    beforeEach(() => {
      const config = factories.buildSingleCommandConfig((c) =>
        c
          .setValue()
          .buildValue((v) =>
            v
              .objectValue()
              .addItem((i) =>
                i.setKey("key1").setValueF((v) => v.constantValue()),
              ),
          ),
      );
      data.render(config);
    });

    describe("Object item value editor", () => {
      let valueElement: HTMLElement;

      beforeEach(() => {
        valueElement = getObjectKeys(data.scope)[0]!;
      });

      it("Is collapsed by default", async () => {
        const button = getExpandCollapseButton(within(valueElement));
        expect(button).to.have.attribute("aria-expanded", "false");
      });

      describe("Changing the value type", () => {
        beforeEach(async () => {
          const select = within(valueElement).getByRole("combobox");
          await data.user.selectOptions(select, "Choice input");
        });

        it("Should expand the value", () => {
          const button = getExpandCollapseButton(within(valueElement));
          expect(button).to.have.attribute("aria-expanded", "true");
        });

        it("Should remember the expansion after rerender", () => {
          data.rerender();
          valueElement = getObjectKeys(data.scope)[0]!;
          expect(valueElement.isConnected, "Connected").is.true;
          const button = getExpandCollapseButton(within(valueElement));
          expect(button).to.have.attribute("aria-expanded", "true");
        });
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
