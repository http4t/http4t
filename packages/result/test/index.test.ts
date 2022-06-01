import chai from "chai";
import {isFailure, isSuccess, success} from "@http4t/result";
import {failure, merge, prefix, problem} from "@http4t/result/JsonPathResult";

const {expect} = chai;

describe('Problem', () => {
    it('has a nice toString()', async () => {
        const p = problem("message", [0, "field"]);
        expect(p.toString()).eq('$.[0].field: message');
    });
});

describe('Failure', () => {
    it('toString() from just a message', async () => {
        const p = failure("message");
        expect(p.toString()).eq(`$: message`);
    });

    it('toString() from message and path', async () => {
        const p = failure("message", ["path"]);
        expect(p.toString()).eq(`$.path: message`);
    });

    it('toString() from list of problems', async () => {
        const p = failure(problem("first"), problem("second"));
        expect(p.toString()).eq(`$: first\r\n$: second`);
    });

    it('merge()', async () => {
        const p = merge(failure("first"), failure("second"));
        expect(p.toString()).eq(`$: first\r\n$: second`);
    });

    it('prefix()', async () => {
        const p = prefix(failure("message", ["path"]), ["prefix"]);
        expect(p.toString()).eq(`$.prefix.path: message`);
    });
});

describe('isSuccess', () => {
    it('success', async () => {
        expect(isSuccess(success(undefined))).eq(true);
    });
    it('failure', async () => {
        expect(isSuccess(failure(""))).eq(false);
    });
});

describe('isFailure', () => {
    it('success', async () => {
        expect(isFailure(success(undefined))).eq(false);
    });
    it('failure', async () => {
        expect(isFailure(failure(""))).eq(true);
    });
});
