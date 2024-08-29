import { render } from "../src/configuration-editor";
import { fullConfiguration, parseConfigurationOrThrow } from "../test/fixtures";

let data = fullConfiguration;
try {
  const storedConfig = localStorage.getItem("config");
  if (storedConfig) {
    data = JSON.parse(storedConfig);
  }
} catch {
  // suppres prettier collapsing block, which cause an eslint error
}

render(
  document.getElementById("app")!,
  parseConfigurationOrThrow(data),
  (config) => {
    //console.log({ config });
    console.log(config.editorConfiguration.expanded);
    //console.log(new Error());
    localStorage.setItem("config", JSON.stringify(config));
  },
);
