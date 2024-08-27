import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { QueryFunctions } from "../types";
import { OnConfigChanged, render } from "src/configuration-editor";
import { buildPluginConfiguration } from "test/configuration-factories";
import { within } from "@testing-library/dom";
import { getForgeSections } from "../dom-queries";
import { expect } from "chai";
import { PluginConfiguration } from "src/plugin-configuration";

const getControlledElement = (element: HTMLElement): HTMLElement | null => {
  const id = element.getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
};

describe("Forge editor", () => {
  let user: UserEvent;

  before(() => {
    user = userEvent.setup(global);
  });

  let scope: QueryFunctions;
  let root: HTMLElement;
  let onConfigChanged: sinon.SinonStub<
    Parameters<OnConfigChanged>,
    ReturnType<OnConfigChanged>
  >;
  let pluginConfig: PluginConfiguration;

  beforeEach(() => {
    root = document.body.appendChild(document.createElement("div"));
    scope = within(root);
    onConfigChanged = sinon.stub();
    onConfigChanged.callsFake((x) => {
      pluginConfig = x;
    });
  });

  afterEach(() => {
    window.document.body.removeChild(root);
  });

  let button: HTMLElement;

  const rerender = () => {
    window.document.body.removeChild(root);
    root = document.body.appendChild(document.createElement("div"));
    scope = within(root);
    render(root, pluginConfig, onConfigChanged);
  };

  const getExpandCollapseButton = (scope: QueryFunctions) => {
    return scope.getByRole("button", {
      name: /Expand|Collapse/,
    });
  };

  describe("A single forge", () => {
    beforeEach(() => {
      pluginConfig = buildPluginConfiguration((x) =>
        x.addForge((f) => f.setName("Test Forge")),
      );
      render(root, pluginConfig, onConfigChanged);
      button = getExpandCollapseButton(scope);
    });

    describe("Expand/collape", () => {
      it("Is collaped by default", () => {
        expect(button).to.have.attribute("aria-expanded", "false");
        const control = getControlledElement(button);
        expect(control).to.have.class("hidden");
      });

      describe("User has clicked expand", () => {
        beforeEach(async () => {
          await user.click(button);
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
            rerender();
          });

          it("Should have the forge expanded", () => {
            const button = getExpandCollapseButton(scope);
            button.should.have.attribute("aria-expanded", "true");
          });
        });
      });
    });
  });

  describe("Multiple forges exist", () => {
    beforeEach(() => {
      pluginConfig = buildPluginConfiguration((p) =>
        p
          .addForge((f) => f.setName("f1"))
          .addForge((f) => f.setName("f2"))
          .addForge((f) => f.setName("f3")),
      );
      rerender();
    });

    describe("First and last section has been expanded", () => {
      beforeEach(async () => {
        const sections = getForgeSections(scope);
        await user.click(getExpandCollapseButton(within(sections[0])));
        await user.click(getExpandCollapseButton(within(sections[2])));
      });

      it("Remember both settings", async () => {
        rerender();
        const sections = getForgeSections(scope);
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
    });
  });
});
