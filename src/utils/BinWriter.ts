import { Type } from "../enums/Type";

export class BinWriter {

    private readonly warnings: boolean;

    private buffer: Buffer;
    
    constructor(warnings: boolean) {
        this.warnings = warnings;
        this.buffer = Buffer.allocUnsafe(0);
    }

    public writeStringType(value: string, annotated: boolean = true): this {
        if (value.split("").some((char) => char.charCodeAt(0) >> 8)) {
            return this.writeWString(value, annotated);
        } else {
            return this.writeString(value, annotated);
        }
    }

    public writeIndexType(value: string | number, annotated: boolean = true): this {
        if (typeof value == "string") {
            return this.writeIndexType(value, annotated);
        } else {
            return this.writeNumberType(Type.INTEGER, value, annotated);
        }
    }

    public writeNumberType(type: Type, value: number | bigint, annotated: boolean = true): this {
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
            this.writeAnnotation(type);
        }

        if (this.warnings && ((type != Type.LONG && typeof value == "bigint") || (typeof value == "number" && value >> size * 8))) {
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

        this.buffer = Buffer.concat([ this.buffer, buffer ]);

        return this;
    }

    public writeString(value: string, annotated: boolean = true): this {
        const bytes = value.split("").map((char) => char.charCodeAt(0));

        if (this.warnings && bytes.some((byte) => byte >> 8)) {
            console.warn("String contains characters that are outside of the ASCII range.");
        }

        if (annotated) {
            this.writeAnnotation(Type.STRING);
        }
        
        this.buffer = Buffer.concat([ this.writeNumberType(Type.INTEGER, value.length).buffer, Buffer.from(bytes) ]);

        return this;
    }

    public writeWString(value: string, annotated: boolean = true): this {
        if (annotated) {
            this.writeAnnotation(Type.WSTRING);
        }

        this.buffer = Buffer.concat([ this.writeNumberType(Type.INTEGER, value.length).buffer, Buffer.from(value.split("").flatMap((char) => {
            const code = char.charCodeAt(0);

            return [ code >> 8, code & 0xFF ];
        })) ]);

        return this;
    }

    public writeNull(): this {
        this.writeAnnotation(Type.NULL);

        return this;
    }

    public writeBool(value: boolean, annotated: boolean = true): this {
        if (annotated) {
            this.writeAnnotation(Type.BOOL);
        }

        this.buffer = Buffer.concat([ this.buffer, Buffer.from([ +value ]) ]);

        return this;
    }

    public writeChar(value: string, annotated: boolean = true): this {
        if (annotated) {
            this.writeAnnotation(Type.CHAR);
        }

        this.buffer = Buffer.concat([ this.buffer, Buffer.from([ value.charCodeAt(0) ]) ]);

        return this;
    }

    public writeWChar(value: string, annotated: boolean = true): this {
        const code = value.charCodeAt(0);

        if (annotated) {
            this.writeAnnotation(Type.WCHAR);
        }

        this.buffer = Buffer.concat([ this.buffer, Buffer.from([ code >> 8, code & 0xFF ]) ]);

        return this;
    }

    private writeAnnotation(type: Type): this {
        this.buffer = Buffer.concat([ this.buffer, Buffer.from([ type >> 8, type & 0xFF ]) ]);

        return this;
    }
}