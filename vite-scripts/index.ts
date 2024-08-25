import { parseConfigurationOrThrow } from "../test/configuration-editor/value-editor/choice-value-editor.test";
import { render } from "../src/configuration-editor";
import { fullConfiguration } from "../test/fixtures";

render(
  document.getElementById("app")!,
  parseConfigurationOrThrow(fullConfiguration),
  (config) => {
    console.log({ config });
    console.log(new Error());
  },
);
