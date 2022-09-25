import { StructureDesign } from "../../interfaces/StructureDesign";
import { TypeForTypeName } from "../../interfaces/TypeForTypeName";
import { DesignImplementation } from "./DesignImplementation";
import { DesignType } from "./DesignType";

export type DesignTypeSimplifier<T extends DesignType> = T extends keyof TypeForTypeName ?
    TypeForTypeName[T] :
    T extends StructureDesign ?
        DesignImplementation<T> :
        T extends StringConstructor | BigIntConstructor | NumberConstructor | BooleanConstructor ?
            ReturnType<T> :
            T extends null | undefined ?
                null | undefined :
                never;