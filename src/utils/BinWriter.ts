import { Type } from "../enums/Type";

export class BinWriter {

    public writeStringType(value: string, annotated: boolean = true): Buffer {
        if (value.split("").some((char) => char.charCodeAt(0) >> 8)) {
            return this.writeWString(value, annotated);
        } else {
            return this.writeString(value, annotated);
        }
    }

    public writeIndexType(value: string | number, annotated: boolean = true): Buffer {
        if (typeof value == "string") {
            return this.writeIndexType(value, annotated);
        } else {
            return this.writeNumberType(Type.INTEGER, value, annotated);
        }
    }

    public writeNumberType(type: Type, value: number | bigint, annotated: boolean = true): Buffer {
        const size = ((type: Type): number => {
            switch (type) {
                case Type.SHORT: {
                    return 2;
                }
                case Type.INTEGER:
                case Type.FLOAT: {
                    return 4;
                }
                case Type.LONG:
                case Type.DOUBLE: {
                    return 8;
                }
                default: {
                    throw new Error("Invalid number type.");
                }
            }
        })(type);
        const valueOffset = 2 * +annotated;
        const buffer = Buffer.allocUnsafe(valueOffset + size);

        if (annotated) {
            buffer.writeUInt16BE(type, 0);
        }

        if ((type != Type.LONG && typeof value == "bigint") || (typeof value == "number" && value >> size * 8)) {
            console.warn("Number is too large to fit in the specified type. Precision may be lost.");
        }

        switch (type) {
            case Type.SHORT: {
                buffer.writeInt16BE(Number(value), valueOffset);
            } break;
            case Type.INTEGER: {
                buffer.writeInt32BE(Number(value), valueOffset);
            } break;
            case Type.FLOAT: {
                buffer.writeFloatBE(Number(value), valueOffset);
            } break;
            case Type.LONG: {
                buffer.writeBigInt64BE(BigInt(value), valueOffset);
            } break;
            case Type.DOUBLE: {
                buffer.writeDoubleBE(Number(value), valueOffset);
            } break;
        }

        return buffer;
    }

    public writeString(value: string, annotated: boolean = true): Buffer {
        const bytes = value.split("").map((char) => char.charCodeAt(0));

        if (bytes.some((byte) => byte >> 8)) {
            console.warn("String contains characters that are outside of the ASCII range.");
        }

        return Buffer.concat((annotated ? [ this.writeAnnotation(Type.STRING) ] : []).concat(
            this.writeNumberType(Type.INTEGER, value.length),
            Buffer.from(bytes)
        ));
    }

    public writeWString(value: string, annotated: boolean = true): Buffer {
        const bytes = value.split("").flatMap((char) => {
            const code = char.charCodeAt(0);

            return [ code >> 8, code & 0xFF ];
        });

        return Buffer.concat((annotated ? [ this.writeAnnotation(Type.WSTRING) ] : []).concat(
            this.writeNumberType(Type.INTEGER, value.length),
            Buffer.from(bytes)
        ));
    }

    public writeAnnotation(type: Type): Buffer {
        return Buffer.from([ type >> 8, type & 0xFF ]);
    }
}