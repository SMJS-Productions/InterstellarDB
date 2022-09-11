export type EntryValue = null | string | number | BigInt | boolean | Array<EntryValue> | {
    [key: string]: EntryValue
};