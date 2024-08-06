//import { Window } from "happy-dom";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as tl from "@testing-library/dom";
import { emptyConfiguration } from "../src/configuration-schema.js";
import { render } from "../src/configuration-editor.js";

describe("UI", () => {
  before(() => {
    GlobalRegistrator.register();
  });

  after(() => {
    GlobalRegistrator.unregister();
  });

  it("Works?", async () => {
    const d = window.document.createElement("div");
    window.document.body.appendChild(d);
    render(d, emptyConfiguration);
    const button = tl.getByRole(d, "button", { name: "New forge" });
    button.click();
  });
});
