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
      name: "Test forge",
      commands: [
        {
          $command: "set-value",
          key: "const-value",
          value: { $type: "constant", value: "foo value" },
        },
        {
          $command: "set-value",
          key: "text-const-value",
          value: { $type: "string-input", prompt: "Text prompt" },
        },
        {
          $command: "set-value",
          key: "number-const-value",
          value: { $type: "number-input", prompt: "Text prompt" },
        },
        {
          $command: "set-value",
          key: "object-input",
          value: {
            $type: "object",
            values: [
              {
                key: "key-1",
                value: { $type: "number-input", prompt: "Text prompt" },
              },
              {
                key: "key-2",
                value: { $type: "number-input", prompt: "Text prompt" },
              },
            ],
          },
        },
        {
          $command: "set-value",
          key: "choice-input",
          value: {
            $type: "choice-input",
            prompt: "Text prompt",
            options: [
              {
                text: "Option 1",
                value: "VALUE",
              },
              {
                text: "Option 2",
                value: "VALUE",
                commands: [
                  {
                    $command: "set-value",
                    key: "sub-value-1",
                    value: { $type: "constant", value: "foo value" },
                  },
                  {
                    $command: "set-value",
                    key: "sub-value-2",
                    value: { $type: "constant", value: "foo value" },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      name: "Add foo",
      commands: [addFoo],
    },
    { name: "Add bar", commands: [addBar] },
  ],
};

render(document.getElementById("app")!, config);
