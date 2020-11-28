import {failure, success} from "@http4t/result";
import {expect} from 'chai';
import {v, variablesPath} from "@http4t/bidi/paths/variables";

const componentVars = {
    first: v.segment,
    second: v.segment
};

describe('variablesPath()', () => {
    it('does not error if everything is empty', async () => {
        const path = variablesPath({}, () => []);
        expect(path.consume("one/two/")).deep.eq(success({
            value: undefined,
            remaining: "one/two/"
        }));
    });
    it('populates variables from path segments', async () => {
        const path = variablesPath(componentVars, v => [v.first, v.second]);
        expect(path.consume("one/two/")).deep.eq(
            success({
                    value: {first: "one", second: "two"},
                    remaining: "/"
                }
            ));
    });
    it('interpolates literal values from strings', async () => {
        const path = variablesPath(componentVars, v => [v.first, "two", v.second]);
        expect(path.consume("one/two/three")).deep.eq(
            success({
                    value: {first: "one", second: "three"},
                    remaining: ""
                }
            )
        );
    });
    it('throws an exception if segmentFn is not valid', async () => {
        expect(() => variablesPath(componentVars, () => [])).throws("segmentFn did not populate all keys. Missing: first, second");
    });
    describe('parsing', () => {
        it('supports integers', async () => {
            const path = variablesPath({int: v.int}, v => ["one", v.int, "three"]);
            expect(path.consume("one/2222/three")).deep.eq(
                success({
                        value: {int: 2222},
                        remaining: ""
                    }
                )
            );
        });
        it('does not match non-integers, including values Number.parseInt would successfully parse', async () => {
            const path = variablesPath({int: v.int}, v => ["one", v.int, "three"]);
            const consume = path.consume("one/2notanumber2/three");
            expect(consume).deep.eq(failure({message: "expected an integer", remaining: "/2notanumber2/three"}));
        });
        it('supports floats', async () => {
            const path = variablesPath({float: v.float}, v => ["one", v.float, "three"]);
            expect(path.consume("one/2222.222/three")).deep.eq(
                success({
                        value: {float: 2222.222},
                        remaining: ""
                    }
                )
            );
        });
        it('does not match non-floats, including values Number.parseFloat would successfully parse', async () => {
            const path = variablesPath({float: v.float}, v => ["one", v.float, "three"]);
            expect(path.consume("one/2.2notanumber2.2/three"))
                .deep.eq(failure({message: "expected a number", remaining: "/2.2notanumber2.2/three"}));
        });
        it('can split segments', async () => {
            const path = variablesPath({segments: v.upToSegments(2)}, v => [v.segments]);
            expect(path.consume("one/two/three"))
                .deep.eq(success({
                remaining: "/three",
                value: {segments: ["one", "two"]}
            }));
        });
    });
});
