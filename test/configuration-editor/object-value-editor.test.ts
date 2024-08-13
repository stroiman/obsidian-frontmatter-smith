import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
import {
  emptyConfiguration,
  GlobalConfiguration,
} from "src/configuration-schema.js";
import { deepFreeze } from "./helpers";
import { OnConfigChanged, render } from "src/configuration-editor";
import { within } from "@testing-library/dom";
import { QueryFunctions } from "./types";
import { getObjectKeys } from "./dom-queries";
import { expect } from "chai";

describe("Object configuration", () => {
  let user: UserEvent;

  before(() => {
    user = userEvent.setup(global);
  });

  let scope: QueryFunctions;
  let root: HTMLElement;
  let onConfigChanged: sinon.SinonStub<
    Parameters<OnConfigChanged>,
    ReturnType<OnConfigChanged>
  >;

  beforeEach(() => {
    root = document.body.appendChild(document.createElement("div"));
    scope = within(root);
    onConfigChanged = sinon.stub();
  });

  afterEach(() => {
    window.document.body.removeChild(root);
  });

  beforeEach(() => {
    render(root, testConfiguration, onConfigChanged);
  });

  describe("Initial rendering", () => {
    it("Should renders two keys", () => {
      const keys = getObjectKeys(scope);
      expect(keys, "No of rendered keys").to.have.lengthOf(2);
    });
  });

  describe("Add new key", () => {
    beforeEach(async () => {
      await user.click(scope.getByRole("button", { name: "Add value" }));
    });

    it("Should render another key", async () => {
      const keys = getObjectKeys(scope);
      expect(keys, "No of rendered keys").to.have.lengthOf(3);
    });

    it("Should update the config with a new key", () => {
      const actualConfig = onConfigChanged.lastCall.firstArg;
      expect(actualConfig).to.be.like({
        forges: [
          {
            commands: [
              {
                value: {
                  values: [
                    { key: "Option 1" },
                    { key: "Option 2" },
                    {
                      // There should be one more, what are defaults?
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
    });
  });
});

const testConfiguration: GlobalConfiguration = deepFreeze({
  ...emptyConfiguration,
  forges: [
    {
      name: "Forge",
      commands: [
        {
          $command: "set-value",
          key: "key",
          value: {
            $type: "object",
            values: [
              {
                key: "Option 1",
                value: { $type: "constant", value: 123 },
              },
              {
                key: "Option 2",
                value: { $type: "constant", value: 123 },
              },
            ],
          },
        },
      ],
    },
  ],
} satisfies GlobalConfiguration);
