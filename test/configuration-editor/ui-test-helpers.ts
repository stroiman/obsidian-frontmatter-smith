import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { QueryFunctions } from "./types";
import { OnConfigChanged, render } from "src/configuration-editor";
import { within } from "@testing-library/dom";
import { PluginConfiguration } from "src/plugin-configuration";

export const uiTest = () => {
  const result: {
    user: UserEvent;
    scope: QueryFunctions;
    root: HTMLElement;
    onConfigChanged: sinon.SinonStub<
      Parameters<OnConfigChanged>,
      ReturnType<OnConfigChanged>
    >;
    pluginConfig: PluginConfiguration;
    render: () => void;
    rerender: () => void;
  } = {} as any;

  before(() => {
    result.user = userEvent.setup(global);
    result.render = function () {
      if (this.root) {
        window.document.body.removeChild(this.root);
      }
      this.root = document.body.appendChild(document.createElement("div"));
      this.scope = within(this.root);
      render(this.root, this.pluginConfig, this.onConfigChanged);
    }.bind(result);
    result.rerender = result.render;
  });

  beforeEach(() => {
    result.onConfigChanged = sinon.stub();
    result.onConfigChanged.callsFake((x) => {
      result.pluginConfig = x;
    });
  });

  afterEach(() => {
    if (result.root) {
      window.document.body.removeChild(result.root);
      delete (result as any).root;
      delete (result as any).scope;
    }
  });

  return result;
};

export const getExpandCollapseButton = (scope: QueryFunctions) => {
  return scope.getByRole("button", {
    name: /Expand|Collapse/,
  });
};
