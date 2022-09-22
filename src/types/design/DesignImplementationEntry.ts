import { DesignArrayEntry } from "../../interfaces/DesignArrayEntry";
import { DesignEntry } from "../../interfaces/DesignEntry";
import { DesignType } from "./DesignType";
import { DesignTypeSimplifier } from "./DesignTypeSimplifier";

export type DesignImplementationEntry<T extends DesignEntry["type"]> = T extends Array<DesignType | DesignArrayEntry> ?
    {
        [K in keyof T]: T[K] extends DesignArrayEntry ?
            T[K]["array"] extends true ?
                DesignImplementationEntry<T[K]["type"]>[] :
                DesignImplementationEntry<T[K]["type"]> :
            T[K] extends DesignType ?
                DesignTypeSimplifier<T[K]> :
                never
    }[number] :
    T extends DesignType ?
        DesignTypeSimplifier<T> :
        never;