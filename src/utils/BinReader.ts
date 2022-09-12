import { Type } from "../enums/Type";

export class BinReader {

    private readonly checkpoints: number[];
    
    private readonly buffer: Buffer;

    private offset: number;

    constructor(bytes: Buffer) {
        this.checkpoints = [];
        this.buffer = bytes;
        this.offset = 0;
    }

    public hasEnded(): boolean {
        return this.offset >= this.buffer.length;
    }

    public getOffset(): number {
        return this.offset;
    }

    public setOffset(offset: number): this {
        this.offset = offset;

        return this;
    }

    public skip(length: number): this {
        if (this.offset + length <= this.buffer.length) {
            this.offset += length;
        } else {
            this.throwUnexpectedEndOfBuffer();
        }

        return this;
    }

    public addCheckpoint(): number {
        return this.checkpoints.push(this.offset) - 1;
    }

    public rollbackTo(index: number): void {
        this.offset = this.checkpoints[index];
    }

    public readStringType(): string {
        switch (this.readAnnotationWithoutOffset()) {
            case Type.STRING: {
                return this.readString();
            }
            case Type.WSTRING: {
                return this.readWString();
            }
            default: {
                this.throwUnexpectedType();
            }
        }
    }

    public readIndexType(): string | number {
        switch (this.readAnnotationWithoutOffset()) {
            case Type.STRING: {
                return this.readString();
            }
            case Type.WSTRING: {
                return this.readWString();
            }
            case Type.INTEGER: {
                return this.readInteger();
            }
            default: {
                this.throwUnexpectedType();
            }
        }
    }

    public readString(annotated = true): string {
        const checkpoint = this.addCheckpoint();

        if (!annotated || this.compareAnnotation(Type.STRING)) {
            const length = this.readInteger();

            if (this.offset + length <= this.buffer.length) {
                return this.buffer.toString("utf8", this.offset, this.offset += length);
            } else {
                this.rollbackTo(checkpoint);

                this.throwUnexpectedEndOfBuffer();
            }
        } else {
            this.throwUnexpectedType();
        }
    }

    public readWString(annotated = true): string {
        const checkpoint = this.addCheckpoint();

        if (!annotated || this.compareAnnotation(Type.WSTRING)) {
            const length = this.readInteger();

            if (this.offset + length * 2 <= this.buffer.length) {
                return this.buffer.toString("utf16le", this.offset, this.offset += length * 2);
            } else {
                this.rollbackTo(checkpoint);

                this.throwUnexpectedEndOfBuffer();
            }
        } else {
            this.throwUnexpectedType();
        }
    }

    public readBool(annotated = true): boolean {
        return Boolean(this.readBasicBytes(1, annotated ? Type.BOOL : undefined)[0]);
    }

    public readChar(annotated = true): string {
        return String.fromCharCode(this.readBasicBytes(1, annotated ? Type.CHAR : undefined)[0]);
    }

    public readWChar(annotated = true): string {
        return String.fromCharCode(this.readBasicBytes(2, annotated ? Type.WCHAR : undefined).readInt16BE());
    }

    public readShort(annotated = true): number {
        return this.readBasicBytes(2, annotated ? Type.SHORT : undefined).readInt16BE();
    }

    public readInteger(annotated = true): number {
        return this.readBasicBytes(4, annotated ? Type.INTEGER : undefined).readInt32BE();
    }

    public readFloat(annotated = true): number {
        return this.readBasicBytes(4, annotated ? Type.FLOAT : undefined).readFloatBE();
    }

    public readLong(annotated = true): bigint {
        return this.readBasicBytes(8, annotated ? Type.FLOAT : undefined).readBigInt64BE();
    }

    public readDouble(annotated = true): number {
        return this.readBasicBytes(8, annotated ? Type.DOUBLE : undefined).readDoubleBE();
    }

    public readAnnotation(): Type {
        return this.readShort(false);
    }

    public readAnnotationWithoutOffset(): Type {
        if (this.offset + 2 <= this.buffer.length) {
            return this.buffer.readInt16BE(this.offset);
        } else {
            this.throwUnexpectedEndOfBuffer();
        }
    }

    public compareAnnotation(type: Type): boolean {
        if (this.offset + 2 <= this.buffer.length) {
            if (this.readAnnotationWithoutOffset() == type) {
                this.offset += 2;

                return true;
            } else {
                return false;
            }
        } else {
            this.throwUnexpectedEndOfBuffer();
        }
    }

    public throwUnexpectedType(): never {
        throw new Error(`Unexpected type at the byte offset ${this.offset + 1}`);
    }

    public throwUnexpectedEndOfBuffer(): never {
        throw new Error("Unexpected end of buffer");
    }

    private readBasicBytes(length: number, type?: Type): Buffer {
        if (typeof type == "undefined" || this.compareAnnotation(type!)) {
            if (this.offset + length <= this.buffer.length) {
                return this.buffer.subarray(this.offset, this.offset += length);
            } else {
                this.throwUnexpectedEndOfBuffer();
            }
        } else {
            this.throwUnexpectedType();
        }
    }
}