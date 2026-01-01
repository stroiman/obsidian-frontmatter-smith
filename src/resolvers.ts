import { pipe } from "fp-ts/lib/function";
import { addCommands, Data, resolveResult } from "./ForgeConfiguration";
import {
  andThen,
  MetadataCommand,
  ValueResolver,
  ValueResolverResult,
} from "./metadata-command";
import { Modals } from "./modals";

export type Prompt = Pick<Modals, "prompt">;
export type Suggest = Pick<Modals, "suggest">;

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
    return deps.prompt(this.options).then(resolveResult.ret);
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
