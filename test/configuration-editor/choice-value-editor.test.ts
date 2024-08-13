//import { Window } from "happy-dom";
import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
// eslint-disable-next-line
import { within, screen } from "@testing-library/dom";
import {
  emptyConfiguration,
  GlobalConfiguration,
} from "src/configuration-schema.js";
import { OnConfigChanged, render } from "src/configuration-editor";
import { expect } from "chai";
import { QueryFunctions } from "./types";
import { getOptions } from "./dom-queries";
import { deepFreeze } from "./helpers";

let user: UserEvent;

describe("Choice value configuration", () => {
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

  beforeEach(() => {
    render(root, testConfiguration, onConfigChanged);
  });

  describe("Initial render", () => {
    it("Should initialise the text boxes", async () => {
      const options = getOptions(scope);
      const textInput = within(options[0]).getByRole("textbox", {
        name: "Text",
      });
      const valueInput = within(options[0]).getByRole("textbox", {
        name: "Value",
      });
      expect(textInput).to.have.value("Option 1");
      expect(valueInput).to.have.value("Value 1");
    });
  });

  describe("Add value", () => {
    it("Should add a new value", async () => {
      await user.click(scope.getByRole("button", { name: "Add choice" }));
      const options = getOptions(scope);
      const textInput = within(options.at(-1)!).getByRole("textbox", {
        name: "Text",
      });
      await user.clear(textInput);
      await user.type(textInput, "New text value");
      const valueInput = within(options.at(-1)!).getByRole("textbox", {
        name: "Value",
      });
      await user.clear(valueInput);
      await user.type(valueInput, "New value");
      const actualConfig = onConfigChanged.lastCall.firstArg;
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  options: [
                    { text: "Option 1", value: "Value 1" },
                    { text: "Option 2", value: "Value 2" },
                    { text: "New text value", value: "New value" },
                  ],
                },
              },
            ],
          },
        ],
      });
    });
  });

  describe("Remove value", () => {
    it("Should remove the value", async () => {
      let options = getOptions(scope);
      const removeButton = within(options[0]).getByRole("button", {
        name: /^Remove/,
      });
      await user.click(removeButton);
      options = getOptions(scope);
      expect(options).to.have.lengthOf(1);
      const actualConfig = onConfigChanged.lastCall.firstArg;
      expect(actualConfig).to.be.like({
        forges: [
          { commands: [{ value: { options: [{ text: "Option 2" }] } }] },
        ],
      });
    });
  });

  describe("Modifying texts", () => {
    it("Should update option text", async () => {
      const options = getOptions(scope);
      const textInput = within(options[0]).getByRole("textbox", {
        name: "Text",
      });
      await user.clear(textInput);
      await user.type(textInput, "New text value");
      const actualConfig = onConfigChanged.lastCall.firstArg;
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  options: [
                    {
                      text: "New text value",
                    },
                    { text: "Option 2" },
                  ],
                },
              },
            ],
          },
        ],
      });
    });

    it("Should update option value", async () => {
      const options = getOptions(scope);
      const textInput = within(options[0]).getByRole("textbox", {
        name: "Value",
      });
      await user.clear(textInput);
      await user.type(textInput, "New value");
      const actualConfig = onConfigChanged.lastCall.firstArg;
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  options: [
                    {
                      value: "New value",
                    },
                    { value: "Value 2" },
                  ],
                },
              },
            ],
          },
        ],
      });
    });
  });
});

const testConfiguration: GlobalConfiguration = deepFreeze({
  ...emptyConfiguration,
  forges: [
    {
      name: "Forge",
      commands: [
        {
          $command: "set-value",
          key: "key",
          value: {
            $type: "choice-input",
            prompt: "Choice",
            options: [
              {
                text: "Option 1",
                value: "Value 1",
              },
              {
                text: "Option 2",
                value: "Value 2",
              },
            ],
          },
        },
      ],
    },
  ],
});
