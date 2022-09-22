import { DesignEntry } from "../../interfaces/DesignEntry";
import { DesignImplementationEntry } from "./DesignImplementationEntry";

export type DesignImplementationEntryChecks<T extends DesignEntry> = (T["optional"] extends true ? 
    null : 
    never) |
    (T["array"] extends true ?
        DesignImplementationEntry<T["type"]>[] :
        DesignImplementationEntry<T["type"]>)