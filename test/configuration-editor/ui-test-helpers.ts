import sinon from "sinon";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { QueryFunctions } from "./types";
import { OnConfigChanged, render } from "src/configuration-editor";
import { within } from "@testing-library/dom";
import { PluginConfiguration } from "src/plugin-configuration";

type Data = {
  user: UserEvent;
  scope: QueryFunctions;
  root: HTMLElement;
  onConfigChanged: sinon.SinonStub<
    Parameters<OnConfigChanged>,
    ReturnType<OnConfigChanged>
  >;
  pluginConfig: PluginConfiguration;
  render: (configuration?: PluginConfiguration) => void;
  rerender: () => void;
};

export const uiTest = () => {
  const data: Data = {} as any;

  const setupStub = () => {
    data.onConfigChanged = sinon.stub();
    data.onConfigChanged.callsFake((x) => {
      data.pluginConfig = x;
    });
  };

  before(() => {
    data.user = userEvent.setup(global);
    data.render = function (configuration?: PluginConfiguration) {
      if (configuration) {
        this.pluginConfig = configuration;
      }
      if (this.root) {
        window.document.body.removeChild(this.root);
        data.onConfigChanged.callsFake(() => {
          console.error("Test error, calls to old editor after reloading");
          throw new Error();
        });
        setupStub();
      }
      this.root = document.body.appendChild(document.createElement("div"));
      this.scope = within(this.root);
      render(this.root, this.pluginConfig, this.onConfigChanged);
    }.bind(data);
    data.rerender = data.render;
  });

  beforeEach(() => {
    setupStub();
  });

  afterEach(() => {
    if (data.root) {
      window.document.body.removeChild(data.root);
      delete (data as any).root;
      delete (data as any).scope;
    }
  });

  return data;
};

export const getExpandCollapseButton = (scope: QueryFunctions) => {
  return scope.getByRole("button", {
    name: /Expand|Collapse/,
  });
};
