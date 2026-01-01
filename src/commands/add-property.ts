import {
  createId,
  MetadataCommand,
  MetadataOperation,
  ValueResolverResult,
} from "../metadata-command";

export const CommandTypeAddProperty = "add-property";

export class AddProperty<TDeps> implements MetadataCommand<TDeps> {
  constructor(private key: string) {}

  run(deps: TDeps): Promise<ValueResolverResult<MetadataOperation[]>> {
    return Promise.resolve({
      value: [
        (metadata) => {
          if (!(this.key in metadata)) {
            metadata[this.key] = null;
          }
        },
      ],
      commands: [],
    });
  }
}

export const createDefaultAddPropertyCommand = (): AddPropertyCommand => ({
  $id: createId(),
  $command: CommandTypeAddProperty,
  key: "key",
});

/**
 * Adds a new empty field to the frontmatter. Does nothing if the field already
 * exists.
 */
export type AddPropertyCommand = {
  $id: string;
  $command: typeof CommandTypeAddProperty;
  key: string;
};
