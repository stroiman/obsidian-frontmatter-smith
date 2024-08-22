//import { Window } from "happy-dom";
import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
// eslint-disable-next-line
import { within, screen } from "@testing-library/dom";
import { emptyConfiguration } from "src/configuration-schema.js";
import { OnConfigChanged, render } from "src/configuration-editor";
import { expect } from "chai";
import { QueryFunctions } from "./types";
import {
  getCommandSections,
  getErrorMessage,
  getForgeSections,
} from "./dom-queries";
import { deepFreeze } from "./helpers";
import { fullConfiguration } from "test/fixtures";

let user: UserEvent;

before(async () => {
  deepFreeze(emptyConfiguration);
});

describe("UI", () => {
  before(() => {
    user = userEvent.setup(global);
  });

  let scope: QueryFunctions;
  let root: HTMLElement;
  let onConfigChanged: sinon.SinonStub<
    Parameters<OnConfigChanged>,
    ReturnType<OnConfigChanged>
  >;

  beforeEach(() => {
    root = document.body.appendChild(document.createElement("div"));
    scope = within(root);
    onConfigChanged = sinon.stub();
  });

  afterEach(() => {
    window.document.body.removeChild(root);
  });

  it("Should allow adding a new forge", async () => {
    render(root, emptyConfiguration, onConfigChanged);
    getForgeSections(scope).should.have.lengthOf(0);
    const button = scope.getByRole("button", { name: "New forge" });
    await user.click(button);

    getForgeSections(scope).should.have.lengthOf(1);
    onConfigChanged.lastCall.firstArg.should.be.like({ forges: [{}] });
    await user.clear(scope.getByRole("textbox", { name: "Forge name" }));
    await user.type(
      scope.getByRole("textbox", { name: "Forge name" }),
      "New name",
    );
    onConfigChanged.lastCall.firstArg.should.be.like({
      forges: [{ name: "New name" }],
    });
  });

  describe("Changing value", () => {
    it("Should create a new value", async () => {
      render(
        root,
        {
          ...emptyConfiguration,
          forges: [
            {
              name: "dummy",
              commands: [
                {
                  $command: "set-value",
                  key: "key",
                  value: { $type: "constant", value: "123" },
                },
              ],
            },
          ],
        },
        onConfigChanged,
      );
      const dropdown = scope.getByRole("combobox", { name: "Type of value" });
      await user.selectOptions(dropdown, "A text value");
      const input = scope.getByRole("textbox", { name: /Prompt/ });
      await user.clear(input);
      await user.type(input, "The prompt!");
      const lastConfig = onConfigChanged.lastCall.firstArg;
      expect(lastConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: { $type: "string-input", prompt: "The prompt!" },
              },
            ],
          },
        ],
      });
    });
  });

  describe("Default settings for new command", () => {
    beforeEach(async () => {
      render(root, emptyConfiguration, onConfigChanged);
      getForgeSections(scope).should.have.lengthOf(0);
      const button = scope.getByRole("button", { name: "New forge" });
      await user.click(button);
    });

    it("Should have name, 'Forge name ...'", () => {
      getForgeSections(scope).should.have.lengthOf(1);
      onConfigChanged.lastCall.firstArg.should.be.like({
        forges: [
          {
            name: "Forge name ...",
          },
        ],
      });
    });

    it("Should initialise text box with new name", () => {
      const input = scope.getByRole("textbox", { name: "Forge name" });
      input.should.have.value("Forge name ...");
    });

    it("Should have a new 'set-value' command", async () => {
      const sections = getCommandSections(scope);
      sections.should.have.lengthOf(1);
    });
  });

  it("Can find the section for a forge", () => {
    const config = {
      ...emptyConfiguration,
      forges: [
        {
          name: "Test forge",
          commands: [],
        },
      ],
    };
    render(root, config, onConfigChanged);
    const sections = getForgeSections(scope);
    expect(sections).to.have.lengthOf(1);
  });

  it("Should initialise the forge name input", () => {
    const config = {
      ...emptyConfiguration,
      forges: [
        { name: "Forge 1", commands: [] },
        { name: "Forge 2", commands: [] },
      ],
    };
    render(root, config);
    const inputs = scope.getAllByRole("textbox", { name: "Forge name" });
    inputs.should.have.lengthOf(2);
    inputs[0].should.have.value("Forge 1");
    inputs[1].should.have.value("Forge 2");
  });

  describe("Value options configuration", () => {
    it("Should set constant value", async () => {
      render(root, emptyConfiguration, onConfigChanged);
      await user.click(scope.getByRole("button", { name: "New forge" }));
      const input = scope.getByRole("textbox", { name: "Value" });
      await user.clear(input);
      await user.type(input, '"THE VALUE"');
      onConfigChanged.lastCall.firstArg.should.be.like({
        forges: [
          {
            commands: [
              {
                $command: "set-value",
                value: { $type: "constant", value: "THE VALUE" },
              },
            ],
          },
        ],
      });
    });

    describe("Non-valid JSON input", () => {
      let input: HTMLElement;

      beforeEach(async () => {
        render(root, emptyConfiguration, onConfigChanged);
        await user.click(scope.getByRole("button", { name: "New forge" }));
        input = scope.getByRole("textbox", { name: "Value" });
        await user.clear(input);
        await user.type(input, '"bad input');
        await user.tab();
      });

      it("Should show validation errors", () => {
        input.should.have.attribute("aria-invalid", "true");
        expect(getErrorMessage(input)).to.equal("Invalid JSON");
      });

      it("Should clear the validation error after fix", async () => {
        await user.type(input, '"');
        await user.tab();
        input.should.have.attribute("aria-invalid", "false");
        expect(getErrorMessage(input)).to.be.undefined;
      });
    });
  });

  describe("Add/change/remove command", () => {
    beforeEach(() => {
      render(
        root,
        {
          ...emptyConfiguration,
          forges: [{ name: "Empty forge", commands: [] }],
        },
        onConfigChanged,
      );
    });

    describe("Add set-value command", () => {
      beforeEach(async () => {
        await user.selectOptions(scope.getByRole("combobox"), "Set value");
        await user.click(scope.getByRole("button", { name: "Add command" }));
      });

      it("Should add a new UI element", async () => {
        const regions = getCommandSections(scope);
        expect(regions).to.have.lengthOf(1);
      });

      it("Should add to the configuration", async () => {
        expect(onConfigChanged.lastCall.lastArg).to.be.like({
          forges: [{ commands: [{ $command: "set-value" }] }],
        });
      });

      describe("Remove command", () => {
        beforeEach(async () => {
          const lastSection = getForgeSections(scope).at(-1)!;
          const removeButton = within(lastSection).getByRole("button", {
            name: /^Remove/,
          });
          await user.click(removeButton);
        });

        it("Should remove the command from the UI", () => {
          const regions = getCommandSections(scope);
          expect(regions).to.have.lengthOf(0);
        });

        it("Should remove the command from the configuration", async () => {
          expect(onConfigChanged.lastCall.lastArg).to.be.like({
            forges: [{ commands: [] }],
          });
        });
      });
    });

    describe("Add add-array-element command", () => {
      beforeEach(async () => {
        await user.selectOptions(scope.getByRole("combobox"), "Add to array");
        await user.click(scope.getByRole("button", { name: "Add command" }));
      });

      it("Should add a new UI element", async () => {
        const regions = getCommandSections(scope);
        expect(regions).to.have.lengthOf(1);
      });

      it("Should add to the configuration", async () => {
        expect(onConfigChanged.lastCall.lastArg).to.be.like({
          forges: [{ commands: [{ $command: "add-array-element" }] }],
        });
      });

      describe("Remove command", () => {
        beforeEach(async () => {
          const lastSection = getForgeSections(scope).at(-1)!;
          const removeButton = within(lastSection).getByRole("button", {
            name: /^Remove/,
          });
          await user.click(removeButton);
        });

        it("Should remove the command from the UI", () => {
          const regions = getCommandSections(scope);
          expect(regions).to.have.lengthOf(0);
        });

        it("Should remove the command from the configuration", async () => {
          expect(onConfigChanged.lastCall.lastArg).to.be.like({
            forges: [{ commands: [] }],
          });
        });
      });
    });
  });

  describe("Sensible behaviour", () => {
    it("Should not call the update function on render", async () => {
      //onConfigChanged.throws();
      render(root, fullConfiguration, onConfigChanged);
      await new Promise((r) => setImmediate(r));
      onConfigChanged.should.not.have.been.called;
    });
  });
});