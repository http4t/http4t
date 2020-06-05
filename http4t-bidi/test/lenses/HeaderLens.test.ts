import {failure, success} from "@http4t/result";
import {request} from "@http4t/core/requests";
import {expect} from 'chai';
import {HeaderLens} from "../../src/lenses/HeaderLens";

describe("HeaderLens", () => {

    it("should be able to get a header out of a message", async () => {
        const headerLens = new HeaderLens("Location");

        const message = request("GET", "/", undefined, ["Location", "Jamaica"]);

        expect(await headerLens.extract(message)).deep.eq(success("Jamaica"))
    })

    it("fails if header aint there", async () => {
        const headerLens = new HeaderLens("Location");

        const message = request("GET", "/", undefined, ["Loca", "Jamaica"]);

        expect((await headerLens.extract(message))).deep.eq(failure("Expected header \"Location\""))
    })

    it("should be able to put a header in a message", async () => {
        const headerLens = new HeaderLens("Location");

        const message = request("GET", "/", undefined, ["Location", "Jamaica"]);

        expect((await headerLens.inject("UK", message)).headers).deep.eq([["Location", "UK"]])
    })
})