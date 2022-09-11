export type AnnotatedEntryValue = {
    annotation: number,
    value: null | string | number | BigInt | boolean | Array<AnnotatedEntryValue> | {
        [key: string]: AnnotatedEntryValue
    }
};