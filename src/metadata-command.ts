import { Modals } from "./modals";
import { nanoid } from "nanoid";

export type FrontMatter = { [key: string]: unknown };
export type MetadataOperation = (input: FrontMatter) => void;

/**
 * Lazily resolves the commands to be executed for a specific configuration
 * rule. Argument deps contain anything unknown at configuration time, e.g.,
 * mostly a component to open modals.
 */
export interface ValueResolver<T, TDeps> {
  run(deps: TDeps): Promise<ValueResolverResult<T>>;
}

export const andThen =
  <T, U>(
    fn: (x: T) => ValueResolverResult<U> | Promise<ValueResolverResult<U>>,
  ) =>
  async (
    x: ValueResolverResult<T> | Promise<ValueResolverResult<T>>,
  ): Promise<ValueResolverResult<U>> => {
    const prev = await x;
    const { value, commands } = await fn(prev.value);
    return { value, commands: [prev.commands, commands].flat() };
  };
export const map =
  <T, U>(fn: (x: T) => U | Promise<U>) =>
  async (
    x: ValueResolverResult<T> | Promise<ValueResolverResult<T>>,
  ): Promise<ValueResolverResult<U>> => {
    const prev = await x;
    return { value: await fn(prev.value), commands: prev.commands };
  };
export type ValueResolverResult<T> = {
  /** The operation to run as a result of this being resolved */
  value: T;
  /** New commands that need to be resolved, eventually returning new results */
  commands: MetadataCommand<Modals>[];
};

export interface MetadataCommand<TDeps> {
  run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>>;
}

export const createId = nanoid;
