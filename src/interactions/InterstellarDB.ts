import { existsSync, readFile, readFileSync } from "fs";
import { Options } from "../interfaces/Options";
import { DBInfo } from "../structures/DBInfo";
import { Entry } from "../structures/Entry";
import { INode } from "../structures/INode";
import { EntryValue } from "../types/EntryValue";
import { BinReader } from "../utils/BinReader";

export class InterstellarDB {

    public static init(path: string, options?: Partial<Options>): InterstellarDB;
    public static init(path: string, options?: Partial<Options> & { asynchronous: true }): Promise<InterstellarDB>;
    public static init(path: string, options?: Partial<Options>): InterstellarDB | Promise<InterstellarDB> {
        if (options?.asynchronous) {
            return new Promise((resolve, reject) => {
                if (existsSync(path)) {
                    readFile(path, (error, buffer) => {
                        if (error) {
                            reject(error);
                        } else {
                            try {
                                resolve(new InterstellarDB(path, buffer, options));
                            } catch(error) {
                                reject(error);
                            }
                        }
                    });
                } else {
                    try {
                        resolve(new InterstellarDB(path, options));
                    } catch(error) {
                        reject(error);
                    }
                }
            });
        } else {
            return new InterstellarDB(path, options);
        }
    }

    public static readonly CURRENT_VERSION = DBInfo.VERSION;
    
    public readonly version: number;

    public readonly x64: boolean;
    
    public readonly lastUpdate: Date;
    
    public readonly creation: Date;

    private readonly reader?: BinReader;

    private readonly iNodes: Map<string | number, INode> = new Map();

    private readonly entries: Map<string | number, Map<string | number, number | Record<string, EntryValue>>>;

    private readonly options: Partial<Options>;

    private constructor(path: string, buffer: Buffer, options?: Partial<Options>);
    private constructor(path: string, options?: Partial<Options>);
    private constructor(arg0: string, arg1?: Partial<Options> | Buffer, arg2?: Partial<Options>) {
        const hasBuffer = arg1 instanceof Buffer;

        this.iNodes = new Map();
        this.entries = new Map();

        if (hasBuffer || existsSync(arg0)) {
            const reader = new BinReader(hasBuffer ? arg1 : readFileSync(arg0));
            const { version, x64, lastUpdate, creation } = new DBInfo(reader);
            const { entries } = new INode(reader, x64, true);

            this.version = version;
            this.lastUpdate = lastUpdate;
            this.creation = creation;
            this.reader = reader;
            this.options = (hasBuffer ? arg2 : arg1) ?? {};
            this.x64 = this.options.x64 ?? x64;

            entries.forEach((offset, name) => {
                const iNode = new INode(reader.setOffset(offset), x64);

                this.iNodes.set(name, iNode);
                this.entries.set(name, iNode.entries);
            });
        } else {
            const date = new Date();

            this.version = InterstellarDB.CURRENT_VERSION;
            this.lastUpdate = date;
            this.creation = date;
            this.options = arg1 ?? {};
            this.x64 = this.options.x64 ?? false;
        }
    }

    public getEntryNames(structure: string): Array<number | string> {
        const iNode = this.entries.get(structure);

        if (iNode) {
            return Array.from(iNode.keys());
        } else {
            throw new Error(`Structure "${structure}" does not exist`);
        }
    }

    public getEntry<T extends Record<string, EntryValue>>(structure: string, entry: string | number): T {
        const entries = this.entries.get(structure);

        if (entries) {
            if (Array.from(entries.keys()).includes(entry)) {
                const cacheEntry = entries.get(entry)!;

                if (typeof cacheEntry == "number" && this.reader) {
                    const readEntry = new Entry(this.reader.setOffset(cacheEntry), this.iNodes.get(structure)!.structure.struct);

                    if (!this.options.no_cache) {
                        entries.set(entry, readEntry.entry);
                    }

                    return <T>readEntry.entry;
                } else {
                    return <T>cacheEntry;
                }
            } else {
                throw new Error(`Entry "${entry}" does not exist in structure "${structure}"`);
            }
        } else {
            throw new Error(`Structure "${structure}" does not exist`);
        }
    }

    public getEntries<T extends Record<string, EntryValue>>(structure: string): T[] {
        return Object.values(this.getStructure(structure));
    }

    public getStructureNames(): Array<number | string> {
        return Array.from(this.iNodes.keys());
    }

    public getStructure<T extends Record<string, EntryValue>>(structure: string): Record<string, T> {
        const entries = this.entries.get(structure);

        if (entries) {
            return <Record<string, T>>Object.fromEntries(Array.from(entries.entries()).map(([ key, value ]) => {
                if (typeof value == "number" && this.reader) {
                    const readEntry = new Entry(this.reader.setOffset(value), this.iNodes.get(structure)!.structure.struct);

                    if (!this.options.no_cache) {
                        entries.set(key, readEntry.entry);
                    }

                    return [ key, readEntry.entry ];
                } else {
                    return [ key, value ];
                }
            }));
        } else {
            throw new Error(`Structure "${structure}" does not exist`);
        }
    }
}