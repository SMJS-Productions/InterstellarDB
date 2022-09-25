import { StructureDesign } from "../../interfaces/StructureDesign";
import { TypeForTypeName } from "../../interfaces/TypeForTypeName";

export type DesignType = null | undefined | StringConstructor | BigIntConstructor | NumberConstructor | BooleanConstructor | StructureDesign | keyof TypeForTypeName;