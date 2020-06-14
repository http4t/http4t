import {failure, success} from "@http4t/result";
import {expect} from 'chai';
import {path} from "../../src/paths";
import {v, VariablePath} from "../../src/paths/variables";

const componentVars = {
    widgetId: v.segment,
    componentId: v.segment
};

const componentPath = path(componentVars, v =>
    ["/widgets/", v.widgetId, "/components/", v.componentId]);

/**
 * Note- also tests {@link Joined} and {@link VariablePath}
 */
describe('path()', () => {
    it('can extract matching path', async () => {
        expect(componentPath.consume("/widgets/123/components/456"))
            .deep.eq(
            success({
                value: {
                    widgetId: "123",
                    componentId: "456"
                },
                remaining: ""
            })
        )
    });
    it('fails if path does not match', async () => {
        expect(componentPath.consume("/widgets/123/components"))
            .deep.eq(failure({message: "path did not match", remaining: ""}))
    });
    it('leaves non-matching remainder of path', async () => {
        expect(componentPath.consume("/widgets/123/components/456/doesnotmatch"))
            .deep.eq(success({
            value: {
                widgetId: "123",
                componentId: "456"
            },
            remaining: "/doesnotmatch"
        }))
    });
    it('can inject', async () => {
        expect(componentPath.expand({widgetId: "123", componentId: "456"}))
            .deep.eq("/widgets/123/components/456")
    });
});
