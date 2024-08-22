import van, { ChildDom } from "vanjs-core";
import * as classNames from "./index.module.css";
import { h4, p } from "../tags";

const { div } = van.tags;

export const ChildGroup = (...rest: readonly ChildDom[]) =>
  div({ className: classNames.valueList }, ...rest);

export const HeadingWithButton = (props: {
  name: string;
  description: string;
  control: ChildDom;
}) => {
  const { name, description, control } = props;
  return div(
    { className: classNames.commandBlock },
    div(
      { className: classNames.commandBlockLeft },
      h4(
        {
          className: classNames.commandHeading,
        },
        name,
      ),
      p({ className: classNames.commandDescription }, description),
    ),
    control,
  );
};
