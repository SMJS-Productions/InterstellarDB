import { DesignType } from "../types/design/DesignType";

export interface DesignArrayEntry {
    array?: boolean,
    type: DesignType | [DesignType | DesignArrayEntry, ...Array<DesignType | DesignArrayEntry>]
}