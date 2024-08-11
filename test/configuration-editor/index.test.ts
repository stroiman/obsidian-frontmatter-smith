//import { Window } from "happy-dom";
import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
// eslint-disable-next-line
import { within, screen } from "@testing-library/dom";
import { emptyConfiguration } from "src/configuration-schema.js";
import { OnConfigChanged, render } from "src/configuration-editor";
import { expect } from "chai";
import { QueryFunctions } from "./types";
import { getCommandSections, getForgeSections } from "./dom-queries";

let user: UserEvent;

const deepFreeze = (val: unknown) => {
  if (val) {
    switch (typeof val) {
      case "object":
        for (const v of Object.values(val)) {
          deepFreeze(v);
        }
      case "function": // eslint-disable-line
        Object.freeze(val);
        break;
      default:
        break;
    }
  }
};

before(async () => {
  GlobalRegistrator.register();
  user = userEvent.setup(global);
  deepFreeze(emptyConfiguration);
});

after(() => {
  GlobalRegistrator.unregister();
});

describe("UI", () => {
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
});
