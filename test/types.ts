import { TestFileManager, Forge } from "../src/Forge";
import FakeMetadataFileManager from "./fakes/FakeMetadataFileManager";

export type GetTFile<T extends TestFileManager<any>> =
	T extends TestFileManager<infer U> ? U : never;

export type TFile = GetTFile<FakeMetadataFileManager>;
