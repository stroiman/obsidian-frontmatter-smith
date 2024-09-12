import Sortable from "sortablejs";
import * as classNames from "./sortable.module.css";
import { State } from "vanjs-core";
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
 * This makes a range of assumptions:
 * - The children of the container is _already_ initialised from the list
 * - Each draggable item has a `DragHandle`.
 */
export const initSortable = <T extends State<any[]>>(
  container: HTMLElement,
  list: T,
) =>
  Sortable.create(container, {
    handle: `.${handleClassName}`,
    onEnd: createDragEndHandler(list),
  });

export const handleClassName = classNames.dragHandle;

export const DragHandle = () => div({ className: handleClassName }, "x");
