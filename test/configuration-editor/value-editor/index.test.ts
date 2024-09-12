import { uiTest } from "../ui-test-helpers";
import * as factories from "test/configuration-factories";

describe("UI / Constant value", () => {
  const data = uiTest();

  beforeEach(() => {
    const config = factories.buildSingleCommandConfig((c) =>
      c
        .setValue()
        .setValue(factories.createConstantValue({ value: "A string value" })),
    );
    data.render(config);
  });

  it("Is initialised with the saved value", () => {
    const input = data.scope.getByRole("textbox", { name: "Value" });
    input.should.have.value('"A string value"');
  });
});
