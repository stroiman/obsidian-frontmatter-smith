import { render } from "../src/configuration-editor";
import { fullConfiguration } from "../test/fixtures";

render(document.getElementById("app")!, fullConfiguration);
