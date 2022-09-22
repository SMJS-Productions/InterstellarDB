import { StructureDesign } from "../../interfaces/StructureDesign";
import { TypeForTypeName } from "../../interfaces/TypeForTypeName";

export type DesignType = StringConstructor | BigIntConstructor | NumberConstructor | BooleanConstructor | StructureDesign | keyof TypeForTypeName;