import { Modals } from "./modals";
import { pipe } from "fp-ts/function";

export type FrontMatter = { [key: string]: unknown };

type ObjectData = { [key: string]: Data };
export type Data = string | number | boolean | null | Array<Data> | ObjectData;

export type ValueResolverResult<T> = {
  value: T;
  commands: MetadataCommand<Modals>[];
};

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

export interface ValueResolver<T, TDeps> {
  run(deps: TDeps): Promise<ValueResolverResult<T>>;
}

export const resolveResult = {
  ret: <T>(value: T): Promise<ValueResolverResult<T>> =>
    Promise.resolve({ value, commands: [] }),
};

type Prompt = Pick<Modals, "prompt">;
type Suggest = Pick<Modals, "suggest">;

export class NumberResolver implements ValueResolver<number | null, Prompt> {
  constructor(private options: { prompt: string }) {}

  async run(deps: Prompt) {
    const valueString = await deps.prompt(this.options);
    const value = Number(valueString);
    return resolveResult.ret(isNaN(value) ? null : value);
  }
}

export class PromtResolver implements ValueResolver<string | null, Prompt> {
  constructor(private options: { prompt: string }) {}

  run(deps: Prompt) {
    return deps.prompt(this.options).then((x) => resolveResult.ret(x));
  }
}

export class ConstResolver implements ValueResolver<Data, Prompt> {
  constructor(private value: Data) {}

  run(deps: Prompt) {
    return Promise.resolve(resolveResult.ret(this.value));
  }
}

type ChoiceOptions = {
  prompt: string;
  options: {
    text: string;
    value: string;
    commands: MetadataCommand<Modals>[];
  }[];
};

export class ChoiceResolver implements ValueResolver<string | null, Suggest> {
  constructor(private options: ChoiceOptions) {}

  run(deps: Suggest) {
    return deps
      .suggest(this.options.options, this.options.prompt)
      .then((result): Promise<ValueResolverResult<string | null>> => {
        return result
          ? pipe(resolveResult.ret(result.value), addCommands(result.commands))
          : resolveResult.ret(null);
      });
  }
}

export class ObjectResolver implements ValueResolver<Data, Modals> {
  constructor(
    private options: { key: string; resolver: ValueResolver<Data, Modals> }[],
  ) {}

  run(deps: Modals) {
    return this.options.reduce(
      async (prevP, curr) =>
        pipe(
          prevP,
          andThen((prev) =>
            pipe(
              curr.resolver.run(deps),
              andThen((value) => {
                if (!value) {
                  return resolveResult.ret(prev);
                }
                return resolveResult.ret({
                  ...prev,
                  [curr.key]: value,
                });
              }),
            ),
          ),
        ),
      resolveResult.ret({}),
    );
  }
}

export type MetadataOperation = (input: FrontMatter) => void;

export interface MetadataCommand<TDeps> {
  run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>>;
}

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
