import { BinReader } from "../utils/BinReader";

export class DBInfo {

    public static readonly SPEED_OF_LIGHT = 299792458;

    public readonly version: number;
    
    public readonly x64: boolean;

    public readonly creation: Date;

    public readonly lastUpdate: Date;

    constructor(reader: BinReader) {
        const checkpoint = reader.addCheckpoint();

        try {
            if (reader.readInteger(false) == DBInfo.SPEED_OF_LIGHT) {
                this.version = reader.readInteger(false);
                this.x64 = reader.readBool(false);

                const creation = reader.readLong(false);
                const lastUpdate = reader.readLong(false);

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
            reader.rollbackTo(checkpoint);

            throw error;
        }
    }
}