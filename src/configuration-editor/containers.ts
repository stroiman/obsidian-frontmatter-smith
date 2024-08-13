import van, { ChildDom } from "vanjs-core";
import * as classNames from "./containers.module.css";

const { div } = van.tags;

export const ChildGroup = (...rest: readonly ChildDom[]) =>
  div({ className: classNames.valueList }, ...rest);
