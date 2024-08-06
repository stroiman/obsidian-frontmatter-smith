//import { Window } from "happy-dom";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { within } from "@testing-library/dom";
import { emptyConfiguration } from "src/configuration-schema.js";
import { render } from "src/configuration-editor";
import { expect } from "chai";
import { QueryFunctions } from "./types";
import { getForgeSections } from "./dom-queries";

let user: UserEvent;

before(async () => {
  GlobalRegistrator.register();
  user = userEvent.setup(global);
});

after(() => {
  GlobalRegistrator.unregister();
});

describe("UI", () => {
  let scope: QueryFunctions;
  let root: HTMLElement;

  beforeEach(() => {
    root = document.body.appendChild(document.createElement("div"));
    scope = within(root);
  });

  afterEach(() => {
    window.document.body.removeChild(root);
  });

  it("Works?", async () => {
    render(root, emptyConfiguration);
    getForgeSections(scope).should.have.lengthOf(0);
    const button = scope.getByRole("button", { name: "New forge" });
    await user.click(button);
    getForgeSections(scope).should.have.lengthOf(1);
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
    render(root, config);
    const sections = getForgeSections(scope);
    expect(sections).to.have.lengthOf(1);
  });
});
