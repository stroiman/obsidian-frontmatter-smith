import {
  FrontMatter,
  MetadataCommand,
  MetadataOperation,
  ValueResolver,
  ValueResolverResult,
} from "./metadata-command";
import { Modals } from "./modals";
import { pipe } from "fp-ts/function";

type ObjectData = { [key: string]: Data };
export type Data = string | number | boolean | null | Array<Data> | ObjectData;

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

export class SetValue<TDeps> implements MetadataCommand<TDeps> {
  constructor(
    private key: string,
    private option: ValueResolver<Data, TDeps>,
  ) {}

  run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>> {
    return pipe(
      this.option.run(deps),
      map((value) =>
        !value
          ? []
          : [
              (metadata) => {
                metadata[this.key] = value;
              },
            ],
      ),
    );
  }
}

export class AddToArray<TDeps> implements MetadataCommand<TDeps> {
  constructor(
    private key: string,
    private option: ValueResolver<Data, TDeps>,
  ) {}

  async run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>> {
    return pipe(
      this.option.run(deps),
      map((value) => {
        if (!value) {
          return [];
        }
        return [
          (metadata: FrontMatter) => {
            const existing = metadata[this.key];
            metadata[this.key] = [
              ...(Array.isArray(existing) ? existing : []),
              value,
            ];
          },
        ];
      }),
    );
  }
}
