import {
  andThen,
  MetadataCommand,
  ValueResolverResult,
} from "./metadata-command";
import { Modals } from "./modals";
import { pipe } from "fp-ts/function";

type ObjectData = { [key: string]: Data };
export type Data = string | number | boolean | null | Array<Data> | ObjectData;

export const addCommands =
  (commands: MetadataCommand<Modals>[]) =>
  <T>(
    x: ValueResolverResult<T> | Promise<ValueResolverResult<T>>,
  ): Promise<ValueResolverResult<T>> =>
    pipe(
      x,
      andThen((value) => ({ value, commands })),
    );

export const resolveResult = {
  ret: <T>(value: T): Promise<ValueResolverResult<T>> =>
    Promise.resolve({ value, commands: [] }),
};
