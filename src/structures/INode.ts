import { Type } from "../enums/Type";
import { BinReader } from "../utils/BinReader";
import { Structure } from "./Structure";

export class INode<Root extends boolean = false> {

    public readonly structure: Root extends false ? Structure : null;

    public readonly entries: Map<string | number, number>;

    constructor(reader: BinReader, x64: boolean, root: Root = <Root>false) {
        const checkpoint = reader.addCheckpoint();

        try {
            if (reader.compareAnnotation(Type.INODE)) {
                this.entries = new Map();

                if (root) {
                    this.structure = <Root extends false ? Structure : null>null;
                } else {
                    this.structure = <Root extends false ? Structure : null>new Structure(reader);
                }

                const length = reader.readInteger();

                for (let i = 0; i < length; i++) {
                    this.entries.set(
                        reader.readIndexType(),
                        x64 ? Number(reader.readLong() + BigInt(reader.getOffset())) : (reader.readInteger() + reader.getOffset())
                    );
                }
            } else {
                reader.throwUnexpectedType();
            }
        } catch(error) {
            reader.rollbackTo(checkpoint);

            throw error;
        }
    }
}