import {
  buildPluginConfiguration,
  buildSingleForgeConfig,
} from "test/configuration-factories";
import { within } from "@testing-library/dom";
import { getForgeSections } from "../dom-queries";
import { expect } from "chai";
import { getExpandCollapseButton, uiTest } from "../ui-test-helpers";

const getControlledElement = (element: HTMLElement): HTMLElement | null => {
  const id = element.getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
};

describe("Forge editor", () => {
  const data = uiTest();
  let button: HTMLElement;

  describe("A single forge", () => {
    beforeEach(() => {
      data.pluginConfig = buildSingleForgeConfig((f) =>
        f.setName("Test Forge"),
      );
      data.render();
      button = getExpandCollapseButton(data.scope);
    });

    describe("Expand/collape", () => {
      it("Is collaped by default", () => {
        expect(button).to.have.attribute("aria-expanded", "false");
        const control = getControlledElement(button);
        expect(control).to.have.class("hidden");
      });

      describe("User has clicked expand", () => {
        beforeEach(async () => {
          await data.user.click(button);
        });

        it("Should set aria-expanded on the button", async () => {
          button.should.have.attribute("aria-expanded", "true");
        });

        it("Should remove .hidden", () => {
          const control = getControlledElement(button);
          expect(control).to.not.have.class("hidden");
        });

        describe("Editor is opened again", () => {
          beforeEach(() => {
            data.rerender();
          });

          it("Should have the forge expanded", () => {
            const button = getExpandCollapseButton(data.scope);
            button.should.have.attribute("aria-expanded", "true");
          });
        });
      });
    });
  });

  describe("Multiple forges exist", () => {
    beforeEach(() => {
      data.pluginConfig = buildPluginConfiguration((p) =>
        p
          .addForge((f) => f.setName("f1"))
          .addForge((f) => f.setName("f2"))
          .addForge((f) => f.setName("f3")),
      );
      data.rerender();
    });

    describe("First and last section has been expanded", () => {
      beforeEach(async () => {
        const sections = getForgeSections(data.scope);
        await data.user.click(getExpandCollapseButton(within(sections[0])));
        await data.user.click(getExpandCollapseButton(within(sections[2])));
        data.rerender();
      });

      it("Remember both settings", async () => {
        const sections = getForgeSections(data.scope);
        const button1 = getExpandCollapseButton(within(sections[0]));
        const button2 = getExpandCollapseButton(within(sections[1]));
        const button3 = getExpandCollapseButton(within(sections[2]));
        expect(button1, "button1").to.have.attribute("aria-expanded", "true");
        expect(button2, "button2").to.not.have.attribute(
          "aria-expanded",
          "true",
        );
        expect(button3, "button3").to.have.attribute("aria-expanded", "true");
      });

      describe("Remove a forge", () => {
        let firstForgeId: string;

        beforeEach(async () => {
          const sections = getForgeSections(data.scope);
          firstForgeId = data.pluginConfig.smithConfiguration.forges[0].$id;
          await data.user.click(
            within(sections[0]).getByRole("button", { name: /^Remove forge/ }),
          );
        });

        it("Removes the element in the UI", () => {
          expect(getForgeSections(data.scope)).to.have.lengthOf(2);
        });

        it("Removes the forge from the smith configuration", () => {
          expect(data.pluginConfig.smithConfiguration.forges).to.have.lengthOf(
            2,
          );
        });

        it("Removes the element from editor state", async () => {
          expect(
            data.pluginConfig.editorConfiguration.expanded,
          ).to.not.have.ownProperty(firstForgeId);
        });
      });
    });
  });
});
