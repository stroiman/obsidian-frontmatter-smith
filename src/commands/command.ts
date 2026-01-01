export type GenericCommand<T extends string> = {
  $id: string;
  $command: T;
};

export type CommandConfig<T extends string, U extends GenericCommand<T>> = {
  createDefault: () => U;
};
