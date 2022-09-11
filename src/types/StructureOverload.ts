import { StructureDefinition } from "./StructureDefinition";

export type StructureOverload = {
    basic: number,
    complex: StructureDefinition[]
};