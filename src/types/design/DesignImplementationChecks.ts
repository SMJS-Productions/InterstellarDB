import { StructureDesign } from "../../interfaces/StructureDesign";
import { DesignImplementationEntryChecks } from "./DesignImplementationEntryChecks";

export type DesignImplementationChecks<T extends StructureDesign> = {
    [K in keyof T]: DesignImplementationEntryChecks<T[K]>
}