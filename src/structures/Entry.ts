import { Type } from "../enums/Type";
import { AnnotatedEntryValue } from "../types/AnnotatedEntryValue";
import { EntryValue } from "../types/EntryValue";
import { StructureOverload } from "../types/StructureOverload";
import { BinReader } from "../utils/BinReader";

export class Entry<T extends Record<string, EntryValue>> {

    public readonly entry: T;

    constructor(reader: BinReader, structure: Record<string, StructureOverload>) {
        const checkpoint = reader.addCheckpoint();

        try {
            const { value } = this.readTuple(reader);

            if (typeof value == "object" && Array.isArray(value)) {
                this.entry = this.entryConstructor(structure, value);
            } else {
                reader.throwUnexpectedType();
            }
        } catch(error) {
            reader.rollbackTo(checkpoint);

            throw error;
        }
    }

    private readTuple(reader: BinReader): AnnotatedEntryValue {
        const annotation = reader.readAnnotation();

        switch (annotation) {
            case Type.NULL: {
                return { annotation, value: null };
            }
            case Type.STRUCTURE: {
                // Fucky trick to make it a tuple disguised as an object
                return { annotation, value: Object.fromEntries(Object.entries(Array.from({
                    length: reader.readInteger()
                }, () => this.readTuple(reader)))) };
            }
            case Type.ARRAY: {
                return { annotation, value: Array.from({
                    length: reader.readInteger()
                }, () => this.readTuple(reader)) };
            }
            case Type.STRING: {
                return { annotation, value: reader.readString(false) };
            }
            case Type.WSTRING: {
                return { annotation, value: reader.readWString(false) };
            }
            case Type.BOOL: {
                return { annotation, value: reader.readBool(false) };
            }
            case Type.CHAR: {
                return { annotation, value: reader.readChar(false) };
            }
            case Type.WCHAR: {
                return { annotation, value: reader.readWChar(false) };
            }
            case Type.SHORT: {
                return { annotation, value: reader.readShort(false) };
            }
            case Type.INTEGER: {
                return { annotation, value: reader.readInteger(false) };
            }
            case Type.FLOAT: {
                return { annotation, value: reader.readFloat(false) };
            }
            case Type.LONG: {
                return { annotation, value: reader.readLong(false) };
            }
            case Type.DOUBLE: {
                return { annotation, value: reader.readDouble(false) };
            }
            default: {
                reader.throwUnexpectedType();
            }
        }
    }

    private entryConstructor<T extends Record<string, EntryValue>>(
        structure: Record<string, StructureOverload>,
        tuple: Record<number, AnnotatedEntryValue>
    ): T {
        const entries = Object.entries(structure);

        if (entries.length == Object.keys(tuple).length) {
            return <T>Object.fromEntries(Object.entries(structure).map(
                ([ key, overload ], index) => [ key, this.entryValueConstructor(overload, tuple[index]) ]));
        } else {
            this.mismatch();
        }
    }

    private entryValueConstructor<T extends EntryValue>(
        overload: StructureOverload,
        { annotation, value }: AnnotatedEntryValue
    ): T {
        if (typeof value == "object" && value && !(value instanceof BigInt)) {
            const valueIsArray = Array.isArray(value);
            const object = overload.complex.map((struct) => {
                const structIsArray = Array.isArray(struct);

                try {
                    if (structIsArray && valueIsArray) {
                        return value.map((entry) => this.entryValueConstructor(struct[0], entry));
                    } else if (!structIsArray && !valueIsArray) {
                        return this.entryConstructor(struct, value);
                    } else {
                        return false;
                    }
                } catch(error) {
                    return false;
                }
            }).find(Boolean);

            if (object) {
                return <T>object;
            } else {
                this.mismatch();
            }
        } else if (overload.basic & annotation) {
            return <T>value;
        } else {
            this.mismatch();
        }
    }

    private mismatch(): never {
        throw new Error("Structure and entry tuple type mismatch");
    }
}