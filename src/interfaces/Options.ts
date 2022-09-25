export interface Options {
    /**
     * Makes all pointers 64-bit instead of 32-bit. This will require more space but will allow for larger databases.
     * @default false
     */
    x64: boolean,
    /**
     * Reads and writes the database asynchronously. This will improve performance but cause race conditions if used incorrectly.
     * @default false
     */
    asynchronous: boolean,
    /**
     * Disables the use of cache to preserve memory. This will however make the database slower.
     * @default false
     */
    no_cache: boolean,
    /**
     * Enables the use of warning logs if incorrect data causes precision loss.
     * @default false
     */
    enable_warnings: boolean,
    /**
     * Incase an entry supports an overload of types which are the equivalent of the same JS type, this will allow the database to choose the type with the highest priority.
     * Ordered from left to right.
     * @default { "string": [ "char", "wchar", "string", "wstring" ], "number": [ "short", "int", "float", "long", "double" ] }
     */
    type_priority: Partial<{
        string: [ "char" | "wchar" | "string" | "wstring" ],
        number: [ "short" | "int" | "float" | "long" | "double" ]
    }>
}