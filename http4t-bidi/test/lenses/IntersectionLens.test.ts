import {request} from "@http4t/core/requests";
import {success} from "@http4t/result";
import {expect} from 'chai';
import {headers} from "../../src/lenses/HeaderLens";
import {IntersectionLens} from "../../src/lenses/IntersectionLens";
import {MethodLens} from "../../src/lenses/MethodLens";
import {json} from "../../src/lenses/JsonLens";

describe("IntersectionLens", () => {

    it("intersects lenses", async () => {
        const message = request("GET", "/path", JSON.stringify({some: "value"}), ["X-Name", "tom"], ["X-Age", "young"]);
        const methodLens = new MethodLens("GET");

        const jsonLens = json<{ some: "value" }>();

        const intersectionLensOneValue = new IntersectionLens(methodLens, methodLens);
        const intersectionLensTwoValues = new IntersectionLens(headers({name: "X-Name", age: "X-Age"}), jsonLens);

        expect(await intersectionLensOneValue.get(message)).to.deep.eq(success(undefined))
        expect(await intersectionLensTwoValues.get(message)).to.deep.eq(success({
            age: "young",
            name: "tom",
            some: "value"
        }));

    });

})

