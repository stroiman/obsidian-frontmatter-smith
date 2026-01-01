import { CommandConfig } from "./command";
import {
  createId,
  MetadataCommand,
  MetadataOperation,
  ValueResolverResult,
} from "../metadata-command";

export const CommandTypeSetTag = "set-tag";
export type CommandTypeSetTag = typeof CommandTypeSetTag;

export class SetTag<TDeps> implements MetadataCommand<TDeps> {
  constructor(private tag: string) {}

  run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>> {
    return Promise.resolve({
      value: [
        (metadata) => {
          const orgTags = metadata.tags || [];
          const tags = Array.isArray(orgTags) ? orgTags : [];
          if (!tags.includes(this.tag)) {
            tags.push(this.tag);
            tags.sort();
            metadata.tags = tags;
          }
        },
      ],
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

export const setTagConfig: CommandConfig<CommandTypeSetTag, SetTagCommand> = {
  createDefault: createDefaultSetTagCommand,
};
