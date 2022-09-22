import { Type } from "../enums/Type";
import { BinReader } from "../utils/BinReader";
import { BinWriter } from "../utils/BinWriter";

export class DBInfo {

    public static readonly SPEED_OF_LIGHT = 299792458;

    public static readonly VERSION = 1;

    public readonly version: number;
    
    public readonly x64: boolean;

    public readonly creation: Date;

    public lastUpdate: Date;

    constructor(reader: BinReader);
    constructor(x64: boolean, creation: Date);
    constructor(arg0: BinReader | boolean, arg1?: Date) {

        if (arg0 instanceof BinReader) {
            const checkpoint = arg0.addCheckpoint();

            try {
                if (arg0.readInteger(false) == DBInfo.SPEED_OF_LIGHT) {
                    this.version = arg0.readInteger(false);
                    this.x64 = arg0.readBool(false);

                    const creation = arg0.readLong(false);
                    const lastUpdate = arg0.readLong(false);

                    if (creation >= 0 && creation < Number.MAX_SAFE_INTEGER) {
                        this.creation = new Date(Number(creation));
                    } else {
                        throw new Error("Invalid creation date");
                    }

                    if (lastUpdate >= 0 && lastUpdate < Number.MAX_SAFE_INTEGER) {
                        this.lastUpdate = new Date(Number(lastUpdate));
                    } else {
                        throw new Error("Invalid last update date");
                    }
                } else {
                    throw new Error("Sorry, your binary file has to travel at the speed of light to go interstellar");
                }
            } catch(error) {
                arg0.rollbackTo(checkpoint);

                throw error;
            }
        } else if (arg1) {
            this.version = DBInfo.VERSION;
            this.x64 = arg0;
            this.creation = arg1;
            this.lastUpdate = new Date();
        } else {
            throw new Error("Invalid constructor arguments.");
        }
    }

    public write(writer: BinWriter): BinWriter {
        writer.writeNumberType(Type.INTEGER, DBInfo.SPEED_OF_LIGHT, false);
        writer.writeNumberType(Type.INTEGER, this.version, false);
        writer.writeBool(this.x64, false);
        writer.writeNumberType(Type.LONG, this.creation.getTime(), false);
        writer.writeNumberType(Type.LONG, (this.lastUpdate = new Date()).getTime(), false);

        return writer;
    }
}