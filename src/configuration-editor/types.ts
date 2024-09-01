import { State } from "vanjs-core";
import { EditorConfiguration } from "src/plugin-configuration";

export type EditorConfigWrapper = {
  getExpanded: (id: string) => boolean;
  setExpanded: (id: string, val: boolean) => void;
  remove: (id: string) => void;
};

export const wrapEditorConfig = (
  config: State<EditorConfiguration>,
): EditorConfigWrapper => {
  return {
    getExpanded: function (id: string) {
      return config.val.expanded[id] || false;
    },
    setExpanded: function (id: string, val: boolean) {
      const expanded = config.val.expanded;
      config.val = { ...config.val, expanded: { ...expanded, [id]: val } };
    },
    remove: function (id: string) {
      const data = config.val;
      const expanded = { ...data.expanded };
      delete expanded[id];
      config.val = { ...data, expanded };
    },
  };
  /*
  (config as any).getExpanded = function (id: string) {
    return config.val.expanded[id] || false;
  };
  (config as any).setExpanded = function (
    this: EditorConfigWrapper,
    id: string,
    val: boolean,
  ) {
    const expanded = config.val.expanded;
    config.val = { ...config.val, expanded: { ...expanded, [id]: val } };
  };
  (config as any).remove = function (id: string) {
    const data = config.val;
    const expanded = { ...data.expanded };
    delete expanded[id];
    config.val = { ...data, expanded };
  };
  return config as EditorConfigWrapper;
    */
};
