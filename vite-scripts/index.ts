import { render } from "../src/configuration-editor";
import { fullConfiguration } from "../test/fixtures";

render(document.getElementById("app")!, fullConfiguration, (config) => {
  console.log({ config });
  console.log(new Error());
});
