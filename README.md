<div align="center">
  <img width="200px" src="assets/IDB.png">
  <h1>InterstellarDB</h1>
</div>

Welcome to InterstellarDB, a document based database based on the private NeroDB project by [SMJS](https://github.com/SMJSGaming). This database aims to be a simple, yet powerful database for your projects. Using only a single file to store all of your data while being able to lazy load data to save memory.

## Main Goals

* Lazy loading
* Simple to setup
* Single file storage
* Fast
* Extendable to support other languages
* Scalable
* Document based
* Serverless

## Options

| Name            | Description                                                                                                               | Default          |
|-----------------|---------------------------------------------------------------------------------------------------------------------------|------------------|
| x64             | Makes all pointers 64-bit instead of 32-bit. This will require more space but will allow for larger databases             | <pre>false</pre> |
| asynchronous    | Reads and writes the database asynchronously. This will improve performance but cause race conditions if used incorrectly | <pre>false</pre> |
| no_cache        | Disables the use of cache to preserve memory. This will however make the database slower                                  | <pre>false</pre> |
| enable_warnings | Enables the use of warning logs if incorrect data causes precision loss                                                   | <pre>false</pre> |
| type_priority   | Incase an entry supports an overload of types which are the equivalent of the same JS type, this will allow the database to choose the type with the highest priority<br>Ordered from left to right | <pre>{<br>&emsp;"string": [ "char", "wchar", "string", "wstring" ],<br>&emsp;"number": [ "short", "int", "float", "long", "double" ]<br>}</pre> |

## Credits

* [DidaS](https://github.com/Didas-git) - Helping out with debugging some types
