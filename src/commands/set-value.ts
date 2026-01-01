import { pipe } from "fp-ts/lib/function";
import { Data } from "../ForgeConfiguration";
import {
  MetadataCommand,
  MetadataOperation,
  ValueResolver,
  ValueResolverResult,
  createId,
  map,
} from "../metadata-command";
import { Value } from "../smith-configuration-schema";
import { createDefaultValue } from "../configuration-editor/value";

export const CommandTypeSetValue = "set-value";

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

export type SetValueCommand = {
  $id: string;
  $command: typeof CommandTypeSetValue;
  key: string;
  value: Value;
};

export const createDefaultSetValueCommand = (): SetValueCommand => ({
  $id: createId(),
  $command: CommandTypeSetValue,
  key: "Key",
  value: createDefaultValue(),
});
