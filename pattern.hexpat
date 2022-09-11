// ImHex hex pattern file to easily read out the binaries 

#pragma endian big

#include <std/sys.pat>
#include <std/mem.pat>

#define ANNOTATION_C color("9600FF")
#define COMPLEX_ANNOTATION_C color("0000FF")
#define VALUE_C color("00FF89")

using INode;
using INodeEntry;
using INodeRootEntry;
using INodeStructureEntry;

using Structure;
using StructureField;

using ComplexDeclaration;

fn read_big_unsigned(u128 address, u128 size) {
    u128 iterator = size;
    u128 value = 0;

    size -= 1;

    while (iterator) {
        iterator -= 1;
        value |= std::mem::read_unsigned(address + size - iterator, 1) << (iterator * 8);
    }

    return value;
};

fn relative_to_pointer_end(u128 address) {
    return $ + 4;
};

enum Type : u16 {
    INODE = 0x0000,
    NULL = 0x0001,
    STRUCTURE = 0x0002,
    ARRAY = 0x0004,
    STRING = 0x0008,
    WSTRING = 0x0010,
    BOOL = 0x0020,
    CHAR = 0x0040,
    WCHAR = 0x0080,
    SHORT = 0x0100,
    INTEGER = 0x0200,
    FLOAT = 0x0400,
    LONG = 0x0800,
    DOUBLE = 0x1000
};

struct DBInfo {
    u32 annotation [[ANNOTATION_C, comment("The magic number telling the implementation that it's a database")]];
    
    std::assert(annotation == 299792458, "Your bin file has to travel at the speed of light to go interstellar");
    
    u32 version [[color("00FFF4"), comment("The version of the database")]];
    
    std::assert(version == 1, "This version of the database is not supported");
    
    u64 creation [[color("FF0000"), comment("The UNIX timestamp representing the creation date")]];
    u64 update [[color("FFA200"), comment("The UNIX timestamp representing the last edit date")]];
};

namespace types {
    using AnyType;

    struct NULL {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a NULL")]];

        std::assert(annotation == Type::NULL, "The annotation is not a NULL");
    };

    struct Bool {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a bool")]];
        
        std::assert(annotation == Type::BOOL, "The annotation is not a bool");

        bool value [[VALUE_C, comment("The value of the bool")]];
    };

    struct Char {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a char")]];
        
        std::assert(annotation == Type::CHAR, "The annotation is not a char");

        char value [[VALUE_C, comment("The value of the char")]];
    };

    struct WChar {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a wchar")]];
        
        std::assert(annotation == Type::WCHAR, "The annotation is not a wchar");

        char16 value [[VALUE_C, comment("The value of the wchar")]];
    };

    struct Short {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a short")]];
        
        std::assert(annotation == Type::SHORT, "The annotation is not a short");

        u16 value [[VALUE_C, comment("The value of the short")]];
    };

    struct Integer {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading an integer")]];
        
        std::assert(annotation == Type::INTEGER, "The annotation is not an integer");

        u32 value [[VALUE_C, comment("The value of the integer")]];
    };

    struct Float {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a float")]];
        
        std::assert(annotation == Type::FLOAT, "The annotation is not a float");

        float value [[VALUE_C, comment("The value of the float")]];
    };

    struct Long {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a long")]];
        
        std::assert(annotation == Type::LONG, "The annotation is not a long");

        u64 value [[VALUE_C, comment("The value of the long")]];
    };

    struct Double {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading a double")]];
        
        std::assert(annotation == Type::DOUBLE, "The annotation is not a double");

        double value [[VALUE_C, comment("The value of the double")]];
    };

    struct Flags {
        u16 annotation[[ANNOTATION_C, comment("The flags which represent the type")]];

        std::assert(0x1FF9 & annotation == annotation, "The annotation contains invalid flags");
    };

    struct Structure {
        Type annotation [[COMPLEX_ANNOTATION_C, comment("The annotation to tell the implementation that it's reading a structure")]];
        
        std::assert(annotation == Type::STRUCTURE, "The annotation is not a structure");
        
        Integer length [[comment("The length of the structure")]];
        AnyType entries[length.value] [[comment("The entries of the structure")]];
    };

    struct Array {
        Type annotation [[COMPLEX_ANNOTATION_C, comment("The annotation to tell the implementation that it's reading an array")]];
        
        std::assert(annotation == Type::ARRAY, "The annotation is not an array");
        
        Integer length [[comment("The length of the array")]];
        AnyType entries[length.value] [[comment("The entries of the array")]];
    };

    struct String {
        Type annotation [[COMPLEX_ANNOTATION_C, comment("The annotation to tell the implementation that it's reading a string")]];
        
        std::assert(annotation == Type::STRING, "The annotation is not a string");
        
        Integer length [[comment("The length of the string")]];
        char string[length.value] [[color("FF7600"), comment("The bytes of the string")]];
    };

    struct WString {
        Type annotation [[COMPLEX_ANNOTATION_C, comment("The annotation to tell the implementation that it's reading a wstring")]];
        
        std::assert(annotation == Type::STRING, "The annotation is not a wstring");
        
        Integer length [[comment("The length of the wstring")]];
        char16 string[length.value] [[color("FF7600"), comment("The bytes of the wstring")]];
    };

    struct AnyType {
        Type value_annotation [[hidden, no_unique_address]];

        if (value_annotation == Type::NULL) {
            NULL value [[comment("The value of the entry")]]; 
        } else if (value_annotation == Type::STRUCTURE) {
            Structure value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::ARRAY) {
            Array value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::STRING) {
            String value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::WSTRING) {
            WString value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::BOOL) {
            Bool value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::CHAR) {
            Char value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::WCHAR) {
            WChar value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::SHORT) {
            Short value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::INTEGER) {
            Integer value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::FLOAT) {
            Float value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::LONG) {
            Long value [[comment("The value of the entry")]];
        } else if (value_annotation == Type::DOUBLE) {
            Double value [[comment("The value of the entry")]];
        } else {
            std::assert(false, "The value annotation is invalid");
        }
    };

    struct INodePointer {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading an pointer")]];
        
        std::assert(annotation == Type::INTEGER, "The annotation is not an integer");
        
        INode* address : u32 [[VALUE_C, pointer_base("relative_to_pointer_end"), comment("The address of the pointer")]];
    };

    struct EntryPointer {
        Type annotation [[ANNOTATION_C, comment("The annotation to tell the implementation it's reading an pointer")]];
        
        std::assert(annotation == Type::INTEGER, "The annotation is not an integer");

        Array* address : u32 [[VALUE_C, pointer_base("relative_to_pointer_end"), comment("The address of the pointer")]];
    };
}

struct Structure {
    Type annotation [[COMPLEX_ANNOTATION_C, comment("The annotation to tell the implementation that it's reading a structure")]];

    std::assert(annotation == Type::STRUCTURE, "The annotation is not a structure");

    types::Integer length [[comment("The amount of entries in the structure")]];
    StructureField entries[length.value] [[comment("The entries of the structure")]];
};

struct StructureField {
    Type key_annotation [[hidden, no_unique_address]];

    if (key_annotation == Type::STRING) {
        types::String key [[coment("The name of the object field")]];
    } else if (key_annotation == Type::WSTRING) {
        types::WString key [[coment("The name of the object field")]];
    } else {
        std::assert(false, "The key is not a string or wstring");
    }

    u16 value_annotation [[hidden, no_unique_address]];

    if (value_annotation != Type::ARRAY && value_annotation != Type::STRUCTURE) {
        types::Flags basic_flags [[comment("The type flags of the field")]];
    }

    ComplexDeclaration complex_declarations[while(read_big_unsigned($, 2) == Type::ARRAY || read_big_unsigned($, 2) == Type::STRUCTURE)] [[comment("The complex declarations of the field")]];
};

struct INode {
	Type annotation [[color("FEFF00"), comment("The annotation to tell the implementation that it's reading an INode")]];

    std::assert(annotation == Type::INODE, "The annotation is not an INode");

    Type key_annotation [[hidden, no_unique_address]];

    if (key_annotation == Type::STRUCTURE) {
        Structure structure [[comment("A structure definition for the provided entries, if it's left empty it's referring to other INodes")]];
        types::Integer length [[comment("The amount of entries in the INode")]];
        INodeStructureEntry entries[length.value] [[comment("The entries of the INode")]];
    } else if (key_annotation == Type::INTEGER) {
        types::Integer length [[comment("The amount of entries in the INode")]];
        INodeRootEntry entries[length.value] [[comment("The entries of the INode")]];
    } else {
        std::assert(false, "The annotation is not a structure or an integer");
    }
};

struct INodeEntry {
    Type key_annotation [[hidden, no_unique_address]];

    if (key_annotation == Type::STRING) {
        types::String key [[coment("The name representing the entry")]];
    } else if (key_annotation == Type::WSTRING) {
        types::WString key [[coment("The name representing the entry")]];
    } else if (key_annotation == Type::INTEGER) {
        types::Integer key [[coment("The index representing the entry")]];
    } else {
        std::assert(false, "The key is not a string, wstring or integer");
    }
};

struct INodeRootEntry : INodeEntry {
    types::INodePointer offset [[comment("The offset of the entry relative to the end of this field")]];
};

struct INodeStructureEntry : INodeEntry {
    types::EntryPointer offset [[comment("The offset of the entry relative to the end of this field")]];
};

struct ComplexDeclaration {
    Type type_annotation [[hidden, no_unique_address]];

    if (type_annotation == Type::ARRAY) {
        Type annotation [[COMPLEX_ANNOTATION_C, comment("The annotation to tell the implementation it's reading an array")]];
        types::Flags flags [[comment("The type flags of the array")]];
    } else if (type_annotation == Type::STRUCTURE) {
        Structure structure [[comment("The structure of the object")]];
    } else {
        std::assert(false, "The type is not a structure or array");
    }
};

DBInfo info @ 0x00;
INode root @ $;