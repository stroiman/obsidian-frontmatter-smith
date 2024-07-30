import { pipe } from "fp-ts/lib/function";
import {
  andThen,
  map,
  ForgeConfiguration,
  FrontMatter,
  MetadataOperation,
  ValueResolverResult,
} from "./ForgeConfiguration";
import { Modals } from "./modals";

export interface TestFileManager<TFile> {
  processFrontMatter(
    file: TFile,
    fn: (frontMatter: FrontMatter) => void,
  ): Promise<void>;
}

//const asArrayOrEmpty = (input: unknown) => (Array.isArray(input) ? input : []);
//
//const addToArrayOperation = (input: {
//	key: string;
//	value: Data;
//}): MetadataOperation => {
//	return (metadata) => {
//		metadata[input.key] = [...asArrayOrEmpty(metadata[input.key]), input.value];
//	};
//};

const getOperations = async (input: {
  configuration: ForgeConfiguration;
  suggester: Modals;
}): Promise<MetadataOperation[]> => {
  const ops = input.configuration.getOptions();
  const initial: MetadataOperation[] = [];
  const initialValue = { value: initial, commands: ops };
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
          command.run(input.suggester),
          map((result) => [...value, ...result]),
        );
      }),
    );
    return r.then(iter);
  };
  return (await iter(initialValue)).value;
};

//type Operation = (deps: Modals) => Promise<MetadataOperation[]>;

export class Forge<TFile, TFileManager extends TestFileManager<TFile>> {
  fileManager: TFileManager;
  suggester: Modals;
  configuration: ForgeConfiguration;

  constructor(deps: {
    fileManager: TFileManager;
    configuration: ForgeConfiguration;
    suggester: Modals;
  }) {
    this.fileManager = deps.fileManager;
    this.configuration = deps.configuration;
    this.suggester = deps.suggester;
  }

  async run(file: TFile) {
    const operations = await getOperations(this);
    this.fileManager.processFrontMatter(file, (metadata) => {
      operations.forEach((x) => x(metadata));
    });
  }
}
