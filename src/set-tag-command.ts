import {
  createId,
  MetadataCommand,
  MetadataOperation,
  ValueResolverResult,
} from "./metadata-command";

export const CommandTypeSetTag = "set-tag";

export class SetTag<TDeps> implements MetadataCommand<TDeps> {
  constructor(private tag: string) {}

  run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>> {
    return Promise.resolve({
      value: [],
      commands: [],
    });
  }
}

export type SetTagCommand = {
  $id: string;
  $command: typeof CommandTypeSetTag;
  tag: string;
};

export const createDefaultSetTagCommand = (): SetTagCommand => ({
  $id: createId(),
  $command: "set-tag",
  tag: "",
});
