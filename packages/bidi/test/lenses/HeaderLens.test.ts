import {routeFailed} from "@http4t/bidi/lenses";
import {HeaderLens} from "@http4t/bidi/lenses/HeaderLens";
import {requestOf} from "@http4t/core/requests";
import {responseOf} from "@http4t/core/responses";
import {success} from "@http4t/result";
import chai from "chai";

const {expect} = chai;

describe("HeaderLens", () => {

    it("should be able to get a header out of a message", async () => {
        const headerLens = new HeaderLens("Location");
        const message = requestOf("GET", "/", undefined, ["Location", "Jamaica"]);

        expect(await headerLens.get(message)).deep.eq(success("Jamaica"))
    })

    it("fails if header isn't there", async () => {
        const headerLens = new HeaderLens("Location");
        const message = requestOf("GET", "/", undefined, ["Loca", "Jamaica"]);

        expect((await headerLens.get(message))).deep.eq(
            routeFailed(
                "Expected header \"Location\"",
                ["headers"],
                responseOf(400, "Expected header \"Location\"")))
    })

    it("should be able to put a header in a message", async () => {
        const headerLens = new HeaderLens("Location");
        const message = requestOf("GET", "/", undefined, ["Location", "Jamaica"]);

        expect((await headerLens.set(message, "UK")).headers).deep.eq([["Location", "UK"]])
    })
})
