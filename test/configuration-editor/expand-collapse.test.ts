import { getExpandCollapseButton, uiTest } from "./ui-test-helpers";
import { defaultConfiguration } from "../../src/plugin-configuration";
import { expect } from "chai";
import { buildSingleForgeConfig } from "test/configuration-factories";

describe("Configuration editor - Expand/Collapse forge", () => {
  // This duplicates tests elsewhere. It was an attempt to reorganise tests, but
  // it wasn't clear how to proceed, so I left this here.
  // Changing behaviour in expand/collapse may require two tests to change; but
  // rather that then no tests.
  const data = uiTest();
  let expandCollapseButton: HTMLElement;

  describe("Creating a new forge", () => {
    beforeEach(async () => {
      data.render(defaultConfiguration);
      await data.user.click(
        data.scope.getByRole("button", { name: "New forge" }),
      );
      expandCollapseButton = getExpandCollapseButton(data.scope);
    });

    it("Is expanded", () => {
      expect(expandCollapseButton).to.have.attribute("aria-expanded", "true");
    });

    describe("Clicking the button", () => {
      beforeEach(async () => {
        await data.user.click(expandCollapseButton);
      });

      it("Should collapse the button", () => {
        expect(expandCollapseButton).to.have.attribute(
          "aria-expanded",
          "false",
        );
      });

      it("Should be collapsed when rerendering", () => {
        expect(expandCollapseButton).to.have.attribute(
          "aria-expanded",
          "false",
        );
      });

      it("Should remain collapsed after reloading", () => {
        data.rerender();
        expandCollapseButton = getExpandCollapseButton(data.scope);
        expect(expandCollapseButton).to.have.attribute(
          "aria-expanded",
          "false",
        );
      });
    });
  });

  describe("Rendering a configuration with one forge, and default editor state", () => {
    beforeEach(async () => {
      const config = buildSingleForgeConfig((f) => f);
      data.render(config);
      expandCollapseButton = getExpandCollapseButton(data.scope);
    });

    it("Should have the section collapsed", async () => {
      expect(expandCollapseButton).to.have.attribute("aria-expanded", "false");
    });

    describe("Clicking the button", () => {
      beforeEach(async () => {
        await data.user.click(expandCollapseButton);
      });

      it("Should expand the section", () => {
        expect(expandCollapseButton).to.have.attribute("aria-expanded", "true");
      });

      it("Should stay expanded after reloading", () => {
        data.rerender();
        expandCollapseButton = getExpandCollapseButton(data.scope);
        expect(expandCollapseButton).to.have.attribute("aria-expanded", "true");
      });
    });
  });
});
