/**
 * A configuration containing all possible types.
 *
 * Tests should not depend on what is in here. This is just used for sanity
 * tests, where we want to be sure that every case is covered, e.g. rendering a
 * test configuration in a test UI, or verifying that loading the configuration
 * does not result in "updated" events.
 */
export const fullConfiguration: unknown = {
  version: "1",
  forges: [
    {
      name: "Test forge",
      commands: [
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
      ],
    },
    {
      name: "Add foo",
      commands: [
        {
          $command: "set-value",
          key: "foo",
          value: { $type: "constant", value: "foo value" },
        },
      ],
    },
    {
      name: "Add bar",
      commands: [
        {
          $command: "add-array-element",
          key: "bar",
          value: { $type: "constant", value: "bar value" },
        },
      ],
    },
  ],
};
