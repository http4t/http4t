import {request} from "@http4t/core/requests";
import {response} from "@http4t/core/responses";
import {success} from "@http4t/result";
import {expect} from 'chai';
import {routeFailed} from "../../src/lenses";
import {HeaderLens} from "../../src/lenses/HeaderLens";

describe("HeaderLens", () => {

  it("should be able to get a header out of a message", async () => {
    const headerLens = new HeaderLens("Location");

    const message = request("GET", "/", undefined, ["Location", "Jamaica"]);

    expect(await headerLens.get(message)).deep.eq(success("Jamaica"))
  })

  it("fails if header aint there", async () => {
    const headerLens = new HeaderLens("Location");

    const message = request("GET", "/", undefined, ["Loca", "Jamaica"]);

    expect((await headerLens.get(message))).deep.eq(routeFailed("Expected header \"Location\"", response(400)))
  })

  it("should be able to put a header in a message", async () => {
    const headerLens = new HeaderLens("Location");

    const message = request("GET", "/", undefined, ["Location", "Jamaica"]);

    expect((await headerLens.set(message, "UK")).headers).deep.eq([["Location", "UK"]])
  })
})