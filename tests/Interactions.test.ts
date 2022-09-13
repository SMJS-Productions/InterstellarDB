import { expect } from "chai";
import { join } from "path";
import { InterstellarDB } from "../src/interactions/InterstellarDB";


// "test" document:
// |-------|--------------------|
// |       | test (Bool | NULL) |
// |-------|--------------------|
// | entry | NULL               |
// |-------|--------------------|
// 
// "test02" document:
// |---------|--------------|-------------------------|-------------------------------------|
// |         | ID (Integer) | name (String | WString) | name_history ((String | WString)[]) |
// |---------|--------------|-------------------------|-------------------------------------|
// | entry01 | 1            | test_user               | [old_test_user]                     |
// | entry02 | 2            | test_user02             | [old_test_user02, test]             |
// | user    | 3            | Silvia                  | [Sjoerd]                            |
// |---------|--------------|-------------------------|-------------------------------------|
function defaultDBTests(db: InterstellarDB): void {
    it("Should be able to get all structure names", () => {
        const structures = db.getStructureNames();

        expect(structures).to.be.an("array").with.a.lengthOf(2).with.all.members([ "test", "test02" ]);
    });

    it("Should be able to get all entry names from test", () => {
        const keys = db.getEntryNames("test");

        expect(keys).to.be.an("array").with.a.lengthOf(1).with.all.members([ "entry" ]);
    });

    it("Should be able to get all entry names from test02", () => {
        const keys = db.getEntryNames("test02");

        expect(keys).to.be.an("array").with.a.lengthOf(3).with.all.members([ "entry01", "entry02", "user" ]);
    });

    it("Should be able to get the entry from test", () => {
        const entry = db.getEntry("test", "entry");

        expect(entry).to.be.an("object").which.deep.equals({
            test: null
        });
    });

    it("Should be able to get the user entry from test02", () => {
        const user = db.getEntry("test02", "user");

        expect(user).to.be.an("object").which.deep.equals({
            ID: 3,
            name: "Silvia",
            name_history: [ "Sjoerd" ]
        });
    });

    it("Should be able to get all entries of test", () => {
        const entries = db.getStructure("test");

        expect(entries).to.be.an("object").which.deep.equals({
            entry: {
                test: null
            }
        });
    });

    it("Should be able to get all entries of test02", () => {
        const entries = db.getStructure("test02");

        expect(entries).to.be.an("object").which.deep.equals({
            entry01: {
                ID: 1,
                name: "test_user",
                name_history: [ "old_test_user" ]
            },
            entry02: {
                ID: 2,
                name: "test_user02",
                name_history: [ "old_test_user02", "test" ]
            },
            user: {
                ID: 3,
                name: "Silvia",
                name_history: [ "Sjoerd" ]
            }
        });
    });
}

describe("Reading out the complex binary storage through API interactions", () => {
    const db = InterstellarDB.init(join(__dirname, "./resources/complex_test.bin"));

    defaultDBTests(db);
});

describe("Reading out the complex binary storage through API interactions without caches", () => {
    const db = InterstellarDB.init(join(__dirname, "./resources/complex_test.bin"), {
        no_cache: true
    });

    defaultDBTests(db);

    it("Shouldn't have any entries cached", () => {
        expect(Array.from(db["entries"].get("test")!.values())).to.be.an("array").with.a.lengthOf(1).with.all.members([ 120 ]);
        expect(Array.from(db["entries"].get("test02")!.values())).to.be.an("array").with.a.lengthOf(3).with.all.members([ 256, 316, 392 ]);
    })
});

describe("Reading out the complex binary storage through API interactions while in 64-bit porting mode", () => {
    const db = InterstellarDB.init(join(__dirname, "./resources/complex_test.bin"), {
        x64: true
    });

    defaultDBTests(db);
});