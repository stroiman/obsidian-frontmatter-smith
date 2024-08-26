import { render } from "../src/configuration-editor";
import { fullConfiguration, parseConfigurationOrThrow } from "../test/fixtures";

render(
  document.getElementById("app")!,
  parseConfigurationOrThrow(fullConfiguration),
  (config) => {
    console.log({ config });
    console.log(new Error());
  },
);
