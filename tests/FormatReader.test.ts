import { join } from "path";
import { expect } from "chai";
import { readFileSync } from "fs";
import { InterstellarDB } from "../src";
import { BinReader } from "../src/utils/BinReader";
import { DBInfo } from "../src/structures/DBInfo";
import { INode } from "../src/structures/INode";
import { Structure } from "../src/structures/Structure";
import { Entry } from "../src/structures/Entry";
import { Type } from "../src/enums/Type";

// "test" document:
// |------|--------------------|
// |      | test (Bool)        |
// |------|--------------------|
// |------|--------------------|
describe("Reading out the simple binary storage", () => {
    const file = readFileSync(join(__dirname, "./resources/simple_test.bin"));
    const reader = new BinReader(file);

    it("Should read the initial DB info", () => {
        const { version, creation, lastUpdate } = new DBInfo(reader);
        const timestamp = 1661534142811;

        expect(version).to.be.a("number").that.equals(InterstellarDB.CURRENT_VERSION);
        expect(creation).to.be.an.instanceOf(Date);
        expect(lastUpdate).to.be.an.instanceOf(Date);
        expect(creation.getTime()).to.be.a("number").that.equals(timestamp);
        expect(lastUpdate.getTime()).to.be.a("number").that.equals(timestamp);
    });

    it("Should read the root INode", () => {
        const { structure, entries } = new INode(reader, false, true);

        expect(structure).to.be.a("null");
        expect(entries).to.be.a("Map").with.a.lengthOf(1).and.have.key("test");
        expect(entries.get("test")).to.be.a("number").that.equals(51);
    });

    it("Should read the test INode", () => {
        const { structure, entries } = new INode(reader, false);

        expect(structure).to.be.an.instanceOf(Structure);
        expect(structure.struct).to.be.an("object").which.deep.equals({
            test: {
                basic: Type.BOOL,
                complex: []
            }
        });
        expect(entries).to.be.a("Map").which.is.empty;
    });
});

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
describe("Reading out the complex binary storage", () => {
    const file = readFileSync(join(__dirname, "./resources/complex_test.bin"));
    const reader = new BinReader(file);
    const structureINodes = new Map<string, number>();
    const entryINodes = new Map<string, INode>();

    it("Should read the initial DB info", () => {
        const { version, creation, lastUpdate } = new DBInfo(reader);
        const timestamp = 1662370817464;

        expect(version).to.be.a("number").that.equals(InterstellarDB.CURRENT_VERSION);
        expect(creation).to.be.an.instanceOf(Date);
        expect(lastUpdate).to.be.an.instanceOf(Date);
        expect(creation.getTime()).to.be.a("number").that.equals(timestamp);
        expect(lastUpdate.getTime()).to.be.a("number").that.equals(timestamp);
    });

    it("Should read the root INode", () => {
        const { structure, entries } = new INode(reader, false, true);

        structureINodes.set("test", entries.get("test")!);
        structureINodes.set("test02", entries.get("test02")!);

        expect(structure).to.be.a("null");
        expect(entries).to.be.a("Map").with.a.lengthOf(2).and.have.all.keys("test", "test02");
        expect(entries.get("test")).to.be.a("number").that.equals(reader.getOffset());
        expect(entries.get("test02")).to.be.a("number").that.equals(130);
    });

    it("Should read the test INode", () => {
        const { structure, entries } = new INode(reader.setOffset(structureINodes.get("test")!), false);

        entryINodes.set("test", { structure, entries });

        expect(structure).to.be.an.instanceOf(Structure);
        expect(structure.struct).to.be.an("object").which.deep.equals({
            test: {
                basic: Type.BOOL | Type.NULL,
                complex: []
            }
        });
        expect(entries).to.be.a("Map").with.a.lengthOf(1).and.have.all.keys("entry");
        expect(entries.get("entry")).to.be.a("number").that.equals(120);
    });

    it("Should read entry of the test structure", () => {
        const { structure, entries } = entryINodes.get("test")!;
        const { entry } = new Entry(reader.setOffset(entries.get("entry")!), structure.struct);

        expect(entry).to.be.an("object").which.deep.equals({
            test: null
        });
    });

    it("Should read the test02 INode", () => {
        const { structure, entries } = new INode(reader.setOffset(structureINodes.get("test02")!), false);

        entryINodes.set("test02", { structure, entries });

        expect(structure).to.be.an.instanceOf(Structure);
        expect(structure.struct).to.be.an("object").which.deep.equals({
            ID: {
                basic: Type.INTEGER,
                complex: []
            },
            name: {
                basic: Type.STRING | Type.WSTRING,
                complex: []
            },
            name_history: {
                basic: 0,
                complex: [[{
                    basic: Type.STRING | Type.WSTRING,
                    complex: []
                }]]
            }
        });
        expect(entries).to.be.a("Map").with.a.lengthOf(3).and.have.all.keys("entry01", "entry02", "user");
        expect(entries.get("entry01")).to.be.a("number").that.equals(256);
        expect(entries.get("entry02")).to.be.a("number").that.equals(316);
        expect(entries.get("user")).to.be.a("number").that.equals(392);
    });

    it("Should read entry01 of the test02 structure", () => {
        const { structure, entries } = entryINodes.get("test02")!;
        const { entry } = new Entry(reader.setOffset(entries.get("entry01")!), structure.struct);

        expect(entry).to.be.an("object").which.deep.equals({
            ID: 1,
            name: "test_user",
            name_history: [ "old_test_user" ]
        });
    });

    it("Should read entry02 of the test02 structure", () => {
        const { structure, entries } = entryINodes.get("test02")!;
        const { entry } = new Entry(reader.setOffset(entries.get("entry02")!), structure.struct);

        expect(entry).to.be.an("object").which.deep.equals({
            ID: 2,
            name: "test_user02",
            name_history: [ "old_test_user02", "test" ]
        });
    });

    it("Should read user of the test02 structure", () => {
        const { structure, entries } = entryINodes.get("test02")!;
        const { entry } = new Entry(reader.setOffset(entries.get("user")!), structure.struct);

        expect(entry).to.be.an("object").which.deep.equals({
            ID: 3,
            name: "Silvia",
            name_history: [ "Sjoerd" ]
        });
    });
});