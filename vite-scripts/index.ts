import {
  ConfigurationOption,
  GlobalConfiguration,
} from "src/configuration-schema";
import { render } from "../src/configuration-editor";

const addFoo: ConfigurationOption = {
  $command: "set-value",
  key: "foo",
  value: { $type: "constant", value: "foo value" },
};

const addBar: ConfigurationOption = {
  $command: "add-array-element",
  key: "bar",
  value: { $type: "constant", value: "bar value" },
};

const config: GlobalConfiguration = {
  version: "1",
  forges: [
    {
      name: "Add foo",
      commands: [addFoo],
    },
    { name: "Add bar", commands: [addBar] },
  ],
};

render(document.getElementById("app")!, config);
