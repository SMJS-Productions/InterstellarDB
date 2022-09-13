export interface Options {
    /**
     * Makes all pointers 64-bit instead of 32-bit. This will require more space but will allow for larger databases.
     */
    x64: boolean,
    /**
     * Reads and writes the database asynchronously. This will improve performance but cause race conditions if used incorrectly.
     */
    asynchronous: boolean,
    /**
     * Disables the use of cache to preserve memory. This will however make the database slower.
     */
    no_cache: boolean,
    /**
     * Enables the use of warning logs if incorrect data causes precision loss.
     */
    enable_warnings: boolean
}