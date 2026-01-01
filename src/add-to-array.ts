import { pipe } from "fp-ts/lib/function";
import { Data } from "./ForgeConfiguration";
import {
  FrontMatter,
  MetadataCommand,
  MetadataOperation,
  ValueResolver,
  ValueResolverResult,
  createId,
  map,
} from "./metadata-command";
import { Value } from "./smith-configuration-schema";
import { createDefaultValue } from "./configuration-editor/value";

export const CommandTypeAddToArray = "add-array-element";

export type AddToArrayCommand = {
  $id: string;
  $command: typeof CommandTypeAddToArray;
  key: string;
  value: Value;
};

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

export const createDefaultAddToArrayCommand = (): AddToArrayCommand => ({
  $id: createId(),
  $command: CommandTypeAddToArray,
  key: "Key",
  value: createDefaultValue(),
});
