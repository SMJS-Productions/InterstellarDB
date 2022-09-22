import { StructureDesign } from "../../interfaces/StructureDesign";
import { DesignImplementationChecks } from "./DesignImplementationChecks";

export type DesignImplementation<T extends StructureDesign> = Partial<DesignImplementationChecks<T>> & Pick<DesignImplementationChecks<T>, {
    [K in keyof T]: T[K]["optional"] extends true ? never : K
}[keyof T]>;