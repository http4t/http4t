import {requestOf} from "@http4t/core/requests";
import {success} from "@http4t/result";
import {expect} from 'chai';
import {headers} from "@http4t/bidi/lenses/HeaderLens";
import {IntersectionLens} from "@http4t/bidi/lenses/IntersectionLens";
import {expectMethod} from "@http4t/bidi/lenses/MethodLens";
import {json} from "@http4t/bidi/lenses/JsonLens";

describe("IntersectionLens", () => {

    it("intersects lenses", async () => {
        const message = requestOf("GET", "/path", JSON.stringify({some: "value"}), ["X-Name", "tom"], ["X-Age", "young"]);
        const methodLens = expectMethod("GET");

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

