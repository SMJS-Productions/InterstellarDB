import { DesignType } from "../types/design/DesignType";

export interface DesignArrayEntry {
    array?: boolean,
    type: DesignType | Array<DesignType | DesignArrayEntry>
}