//import { Window } from "happy-dom";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { BoundFunctions, queries, within } from "@testing-library/dom";
import { emptyConfiguration } from "src/configuration-schema.js";
import { render } from "src/configuration-editor";
import { expect } from "chai";

type Within = BoundFunctions<typeof queries>;

describe("UI", () => {
  let scope: Within;
  let root: HTMLElement;

  before(() => {
    GlobalRegistrator.register();
  });

  beforeEach(() => {
    root = window.document.createElement("div");
    window.document.body.appendChild(root);
    scope = within(root);
  });

  afterEach(() => {
    window.document.body.removeChild(root);
  });

  after(() => {
    GlobalRegistrator.unregister();
  });

  it("Works?", async () => {
    render(root, emptyConfiguration);
    const button = scope.getByRole("button", { name: "New forge" });
    button.click();
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
    const sections = scope.getAllByRole("region", { name: "Test forge" });
    expect(sections).to.have.lengthOf(1);
  });
});
