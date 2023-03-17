import {get, requestOf, toJSON} from "@http4t/core/requests";
import {isSuccess, success} from "@http4t/result";
import chai from "chai";
import {headers} from "@http4t/bidi/lenses/HeaderLens";
import {intersect, IntersectionLens} from "@http4t/bidi/lenses/IntersectionLens";
import {expectMethod} from "@http4t/bidi/lenses/MethodLens";
import {json} from "@http4t/bidi/lenses/JsonLens";

const {expect} = chai;

describe("IntersectionLens", () => {

    it("get unintersects values of lenses", async () => {
        const message = requestOf("GET", "/", JSON.stringify({some: "value"}),
            ["X-Name", "tom"],
            ["X-Age", "young"],
            ["Content-Type", "application/json"]);

        const lens = new IntersectionLens(
            headers({
                name: "X-Name",
                age: "X-Age"
            }),
            json<{ some: string }>(),
            ab => ({name: ab.name, age: ab.age}),
            ab => ({some: ab.some}));

        const getResult = await lens.get(message);

        expect(getResult).to.deep.eq(success({
            age: "young",
            name: "tom",
            some: "value"
        }));

        if (isSuccess(getResult))
            expect(await toJSON(await lens.set(get("/"), getResult.value))).to.deep.eq(message);
    });

    it("set calls every lens", async () => {
        const message = requestOf("GET", "/", JSON.stringify({some: "value"}), ["X-Name", "tom"], ["X-Age", "young"]);

        const lens = new IntersectionLens(
            headers({
                name: "X-Name",
                age: "X-Age"
            }),
            json(),
            ab => ab,
            ab => ab);

        expect(await lens.get(message)).to.deep.eq(success({
            age: "young",
            name: "tom",
            some: "value"
        }));

    });

    it("get handles undefined gracefully", async () => {
        const message = requestOf("GET", "/path", JSON.stringify({some: "value"}), ["X-Name", "tom"], ["X-Age", "young"]);
        const lensReturningUndefined = expectMethod("GET");

        const lens = intersect(
            lensReturningUndefined,
            headers({name: "X-Name", age: "X-Age"}));

        expect(await lens.get(message)).to.deep.eq(success({
            age: "young",
            name: "tom"
        }));

    });

})

