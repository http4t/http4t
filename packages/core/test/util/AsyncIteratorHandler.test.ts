import chai from "chai";
const { expect } = chai;
import {AsyncIteratorHandler} from "../../src/util/AsyncIteratorHandler";

// TODO: can we simplify this test?
describe('AsyncIteratorHandler', () => {

    it('push then pull', async () => {
        const handler = new AsyncIteratorHandler<string>();

        handler.push("1");
        handler.push("2");
        handler.end();

        expect(await handler.next()).deep.eq({done: false, value: "1"});
        expect(await handler.next()).deep.eq({done: false, value: "2"});
        expect(await handler.next()).deep.eq({done: true, value: undefined});
        expect(await handler.next()).deep.eq({done: true, value: undefined});
    });

    it('pull then push', async () => {
        const handler = new AsyncIteratorHandler<string>();
        const next1 = handler.next();
        const next2 = handler.next();
        const end1 = handler.next();
        const end2 = handler.next();

        handler.push("1");
        handler.push("2");
        handler.end();

        expect(await next1).deep.eq({done: false, value: "1"});
        expect(await next2).deep.eq({done: false, value: "2"});
        expect(await end1).deep.eq({done: true, value: undefined});
        expect(await end2).deep.eq({done: true, value: undefined});
    });

    it('error with full pull queue', async () => {
        const handler = new AsyncIteratorHandler<string>();

        const errors: Error[] = [];
        const next1 = handler.next().catch((e) => errors.push(e));
        const next2 = handler.next().catch((e) => errors.push(e));
        const error1 = handler.next().catch((e) => errors.push(e));
        const error2 = handler.next().catch((e) => errors.push(e));

        handler.push("1");
        handler.push("2");

        expect(await next1).deep.eq({done: false, value: "1"});
        expect(await next2).deep.eq({done: false, value: "2"});

        expect(errors).property('length').eq(0);

        handler.error(new Error("Oops"));

        await error1;
        await error2;

        expect(errors.map(e => e.message)).deep.eq(['Oops', 'Oops']);
    });

    it('error with full push queue', async () => {
        const handler = new AsyncIteratorHandler<string>();


        handler.push("1");
        handler.push("2");
        handler.error(new Error("Oops"));


        expect(await handler.next()).deep.eq({done: false, value: "1"});
        expect(await handler.next()).deep.eq({done: false, value: "2"});

        const errors: Error[] = [];
        await handler.next().catch((e) => errors.push(e));
        await handler.next().catch((e) => errors.push(e));
        expect(errors.map(e => e.message)).deep.eq(['Oops', 'Oops']);
    });

    it('end then pull', async () => {
        const handler = new AsyncIteratorHandler<string>();
        handler.push("1");
        handler.push("2");
        handler.end();

        expect(await handler.next()).deep.eq({done: false, value: "1"});
        expect(await handler.next()).deep.eq({done: false, value: "2"});
        expect(await handler.next()).deep.eq({done: true, value: undefined});
        expect(await handler.next()).deep.eq({done: true, value: undefined});
    });

    it('pull then end', async () => {
        const handler = new AsyncIteratorHandler<string>();
        const next1 = handler.next();
        const next2 = handler.next();
        const end1 = handler.next();
        const end2 = handler.next();

        handler.push("1");
        handler.push("2");
        handler.end();

        expect(await next1).deep.eq({done: false, value: "1"});
        expect(await next2).deep.eq({done: false, value: "2"});

        expect(await end1).deep.eq({done: true, value: undefined});
        expect(await end2).deep.eq({done: true, value: undefined});
        expect(await handler.next()).deep.eq({done: true, value: undefined});
    });

    it('operations after error', async () => {
        const handler = new AsyncIteratorHandler<string>();
        handler.error(new Error());

        expect(() => handler.push("1")).throws(/Iterator is closed/);
        expect(() => handler.error(new Error())).throws(/Iterator is closed/);
        expect(() => handler.end()).throws(/Iterator is closed/);
    });

    it('operations after end', async () => {
        const handler = new AsyncIteratorHandler<string>();
        handler.end();

        expect(() => handler.push("1")).throws(/Iterator is closed/);
        expect(() => handler.error(new Error())).throws(/Iterator is closed/);
        expect(() => handler.end()).not.throws(/Iterator is closed/);
    });
});
