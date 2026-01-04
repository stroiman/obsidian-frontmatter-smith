import { State } from "vanjs-core";
import van from "vanjs-core";
import { EditorConfiguration } from "src/plugin-configuration";

export type EditorConfigWrapper = {
  visible: (id: string, forceExpand?: boolean) => State<boolean>;
  remove: (id: string) => void;
};

export const wrapEditorConfig = (
  config: State<EditorConfiguration>,
): EditorConfigWrapper => {
  return {
    remove: function (id: string) {
      const data = config.val;
      const expanded = { ...data.expanded };
      delete expanded[id];
      config.val = { ...data, expanded };
    },
    visible: function (id: string, forceExpand?: boolean) {
      const visible = van.state(
        forceExpand || config.val.expanded[id] || false,
      );
      van.derive(() => {
        const val = visible.val;
        if (val != visible.oldVal) {
          const expanded = config.val.expanded;
          config.val = { ...config.val, expanded: { ...expanded, [id]: val } };
        }
      });
      return visible;
    },
  };
};
