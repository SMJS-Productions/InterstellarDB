import { StructureDesign } from "../../interfaces/StructureDesign";
import { DesignImplementationEntry } from "./DesignImplementationEntry";

export type DesignImplementation<T extends StructureDesign> = {
    [K in keyof T]: (T[K]["optional"] extends true ? null : never) | 
        (T[K]["array"] extends true ? DesignImplementationEntry<T[K]["type"]>[] : DesignImplementationEntry<T[K]["type"]>)
}