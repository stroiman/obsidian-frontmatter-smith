import van, { ChildDom } from "vanjs-core";

const { div } = van.tags;

type Children = readonly ChildDom[];

export const SettingItem = (...children: Children) =>
  div({ className: "setting-item" }, children);

export const SettingItemInfo = (...children: Children) =>
  div({ className: "setting-item-info" }, children);
//const SettingItemControl = (...children: Children) => {
//  div({ className: "setting-item-control" }, children);
//};

export const SettingItemControl = (...children: Children) =>
  div({ className: "setting-item-control" }, children);

export const SettingItemName = (...children: Children) =>
  div({ className: "setting-item-name" }, children);

export const SettingItemDescription = (...children: Children) =>
  div({ className: "setting-item-description" }, children);

export const Setting = (props: {
  name: string;
  description?: string;
  control?: ChildDom;
}) =>
  SettingItem(
    SettingItemInfo(
      SettingItemName(props.name),
      props.description && SettingItemDescription(props.description),
    ),
    props.control && SettingItemControl(props.control),
  );
