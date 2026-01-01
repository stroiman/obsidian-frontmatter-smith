import { pipe } from "fp-ts/lib/function";
import { Modals } from "./modals";
import { createOperations } from "./ConfigurationFactory";
import {
  andThen,
  FrontMatter,
  map,
  MetadataCommand,
  MetadataOperation,
  ValueResolverResult,
} from "./metadata-command";
import { Command } from "./commands";

export interface TestFileManager<TFile> {
  processFrontMatter(
    file: TFile,
    fn: (frontMatter: FrontMatter) => void,
  ): Promise<void>;
}

export class Forge<TFile, TFileManager extends TestFileManager<TFile>> {
  fileManager: TFileManager;
  suggester: Modals;
  commands: MetadataCommand<Modals>[];

  constructor(deps: {
    fileManager: TFileManager;
    commands: MetadataCommand<Modals>[];
    suggester: Modals;
  }) {
    this.fileManager = deps.fileManager;
    this.commands = deps.commands;
    this.suggester = deps.suggester;
  }

  async getOperations(): Promise<MetadataOperation[]> {
    const initial: MetadataOperation[] = [];
    const initialValue = { value: initial, commands: this.commands };
    const iter = (
      x: typeof initialValue,
    ): Promise<ValueResolverResult<MetadataOperation[]>> => {
      const { value, commands } = x;
      if (commands.length === 0) {
        return Promise.resolve(x);
      }
      const [command, ...rest] = commands;
      const r = pipe(
        { value, commands: rest },
        andThen((value) => {
          return pipe(
            command.run(this.suggester),
            map((result) => [...value, ...result]),
          );
        }),
      );
      return r.then(iter);
    };
    return (await iter(initialValue)).value;
  }

  async run(file: TFile) {
    const operations = await this.getOperations();
    this.fileManager.processFrontMatter(file, (metadata) => {
      operations.forEach((x) => x(metadata));
    });
  }
}

export const createForgeFromConfig = <
  TFile,
  TFileManager extends TestFileManager<TFile>,
>(deps: {
  fileManager: TFileManager;
  forgeConfiguration: { commands: Command[] };
  suggester: Modals;
}) => {
  return new Forge<TFile, TFileManager>({
    fileManager: deps.fileManager,
    suggester: deps.suggester,
    commands: createOperations(deps.forgeConfiguration.commands),
  });
};
