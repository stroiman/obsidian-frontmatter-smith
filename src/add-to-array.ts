import { pipe } from "fp-ts/lib/function";
import { Data } from "./ForgeConfiguration";
import {
  FrontMatter,
  MetadataCommand,
  MetadataOperation,
  ValueResolver,
  ValueResolverResult,
  map,
} from "./metadata-command";

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
