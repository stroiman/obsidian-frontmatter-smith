import Sortable from "sortablejs";
import * as classNames from "./sortable.module.css";
import { ChildDom, State } from "vanjs-core";
import { div } from "./tags";

export const createDragEndHandler =
  <T extends State<any[]>>(list: T) =>
  (e: Sortable.SortableEvent) => {
    const { oldIndex, newIndex } = e;
    if (typeof oldIndex === "number" && typeof newIndex === "number") {
      const copy = [...list.val];
      const moved = copy[oldIndex];
      copy.splice(oldIndex, 1);
      copy.splice(newIndex, 0, moved);
      list.val = copy;
    }
  };

/**
 * Initialises drag'n drop of a collection of elements.
 *
 * This makes a some assumptions:
 * - The children of the container is _already_ initialised from the list
 * - The list is a vanjs `State` object of an array.
 *   - Updating the state is automatically picked up by the system.
 * - Each draggable item has a `DragHandle`.
 *
 * A cleaner solutions would be possible, i.e. one that doesn't require
 * _implicit knowledge_ in the places that use it, but that would probably
 * require making abstractions that really wouldn't be helpful when the code
 * base is not larger than it is.
 */
export const initSortable = <T extends State<any[]>>(
  container: HTMLElement,
  list: T,
) =>
  Sortable.create(container, {
    animation: 150,
    ghostClass: classNames.ghost,
    handle: `.${handleClassName}`,
    onEnd: createDragEndHandler(list),
  });

export const handleClassName = classNames.dragHandle;

export const DragHandle = () => div({ className: handleClassName }, "x");

export const OptionsContainer = (...options: ChildDom[]) =>
  div({ className: classNames.optionsContainer }, ...options);
