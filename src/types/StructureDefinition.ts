import { StructureOverload } from "./StructureOverload";

export type StructureDefinition = [StructureOverload] | Record<string, StructureOverload>;