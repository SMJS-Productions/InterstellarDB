import { BinReader } from "../utils/BinReader";
import { Type } from "../enums/Type";
import { StructureOverload } from "../types/StructureOverload";

export class Structure {

    public readonly struct: Record<string, StructureOverload>;

    constructor(reader: BinReader) {
        const checkpoint = reader.addCheckpoint();

        try {
            if (reader.compareAnnotation(Type.STRUCTURE)) {
                this.struct = this.recursiveStructReader(reader);
            } else {
                reader.throwUnexpectedType();
            }
        } catch(error) {
            reader.rollbackTo(checkpoint);

            throw error;
        }
    }

    private recursiveStructReader(reader: BinReader): Record<string, StructureOverload> {
        return Object.fromEntries(Array.from({ length: reader.readInteger() }, () => [
            reader.readStringType(),
            this.overloadReader(reader)
        ]));
    }

    private overloadReader(reader: BinReader): StructureOverload {
        const type: StructureOverload = { basic: 0, complex: [] };
        const basicAnnotation: number = reader.readAnnotationWithoutOffset();

        if ((Object.values(Type).filter((type) => typeof type == "number").reduce(
            (flags, flag) => flags | <number>flag, 0
        ) - (Type.ARRAY | Type.STRUCTURE) & basicAnnotation) == basicAnnotation) {
            type.basic = reader.readAnnotation();
        } else if (basicAnnotation != Type.STRUCTURE && basicAnnotation != Type.ARRAY) {
            reader.throwUnexpectedType();
        }

        if (!reader.hasEnded()) {
            for (
                let annotation = reader.readAnnotationWithoutOffset();
                annotation == Type.STRUCTURE || annotation == Type.ARRAY;
                annotation = reader.readAnnotationWithoutOffset()
            ) {
                if (annotation == Type.STRUCTURE) {
                    type.complex.push(new Structure(reader).struct);
                } else {
                    type.complex.push([this.overloadReader(reader.skip(2))]);
                }
            }
        }

        if (type.basic || type.complex.length) {
            return type;
        } else {
            reader.throwUnexpectedType();
        }
    }
}