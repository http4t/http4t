import {buildClient} from "@http4t/bidi/client";
import {json} from "@http4t/bidi/lenses/JsonLens";
import {named} from "@http4t/bidi/lenses/NamedLenses";
import {path} from "@http4t/bidi/paths";
import {v, VariablePaths} from "@http4t/bidi/paths/variables";
import {request, text} from "@http4t/bidi/requests";
import {buildRouter} from "@http4t/bidi/router";
import {route} from "@http4t/bidi/routes";
import {HttpHandler} from "@http4t/core/contract";
import {handler} from "@http4t/core/handlers";
import {responseOf} from "@http4t/core/responses";
import {JsonPathError} from "@http4t/result/JsonPathError";
import {problem} from "@http4t/result/JsonPathResult";
import chai from "chai";
import {jsonParseError} from "./utils/json";

const {expect} = chai;

async function catchError(fn: () => any): Promise<any> {
    try {
        await fn();
    } catch (e: any) {
        return e;
    }
}

describe('buildClient()', () => {
    it('serialises request, sends to http handler, and then deserialises response', async () => {
        const routes = {
            example: route(
                request('GET', "/some/path"),
                text()
            )
        };

        async function example(): Promise<string> {
            return "hello world"
        }

        const server = buildRouter(routes, {example});
        const client = buildClient(routes, server);

        expect(await client.example()).deep.eq("hello world");
    });

    it('supports root path', async () => {
        const routes = {
            example: route(
                request('GET', "/"),
                text()
            )
        };

        async function example(): Promise<string> {
            return "hello world"
        }

        const server = buildRouter(routes, {example});
        const client = buildClient(routes, server);

        expect(await client.example()).deep.eq("hello world");
    });

    it('supports path variables', async () => {

        type Account = {
            readonly name: string
        }
        type UserAccounts = {
            readonly accounts: Account[]
        }

        const routes = {
            userAccounts: route(
                request('GET', path({
                    username: v.segment
                }, v => ["accounts/", v.username])),
                json<UserAccounts>()
            ),
            createAccount: route(
                request(
                    'POST',
                    path({username: v.segment}, v => ["accounts/", v.username]),
                    named({account: json<Account>()})),

                json<Account>()
            )
        };

        const accounts: { [username: string]: Account[] } = {};

        async function userAccounts(request: { username: string }): Promise<UserAccounts> {
            return {accounts: accounts[request.username] || []};
        }

        async function createAccount(request: { path: { username: string }, body: { account: Account } }): Promise<Account> {
            const username = request.path.username;
            const account = request.body.account;

            if (!accounts[username]) accounts[username] = [];

            accounts[username].push(account)

            return account;
        }

        const server = buildRouter(routes, {userAccounts, createAccount});
        const client = buildClient(routes, server);

        expect(await client.userAccounts({username: "bob"})).deep.eq({accounts: []});

        const createdAccount = {name: "bob's awesome account"};
        expect(await client.createAccount({
            path: {username: "bob"},
            body: {account: createdAccount}
        })).deep.eq(createdAccount);

        expect(await client.userAccounts({username: "bob"}))
            .deep.eq({accounts: [createdAccount]});
    });

    it('supports variables containing restOfPath', async () => {
        type Vars = {
            path: string[],
        }
        const paths: VariablePaths<Vars> = {
            path: v.restOfPath
        };

        const routes = {
            example: route(
                request('GET', path(paths, v => ["prefix", v.path])),
                json<Vars>()
            )
        };

        async function example(vars: Vars): Promise<Vars> {
            return vars;
        }

        const server = buildRouter(routes, {example});
        const client = buildClient(routes, server);

        expect(await client.example({path: ["some", "long", "path"]}))
            .deep.eq({path: ["some", "long", "path"]});
    });

    it('throws ResultError on response lens failure', async () => {
        const routes = {
            example: route(
                request('GET', "/some/path"),
                json<any>()
            )
        };

        const notJson = "not json}{";
        const brokenServer: HttpHandler = handler(async () => {
                return responseOf(200, notJson)
            }
        );

        const c = buildClient(routes, brokenServer);

        const e: JsonPathError = await catchError(() => c.example());
        delete e.actual['request']
        expect(e).deep.contains({
            problems: [problem("Expected valid json- " + jsonParseError(notJson), ["response", "body"], "example")],
            actual: {response: responseOf(200, notJson)}
        });
    });

    it('throws error when client lens does not match server lens', async () => {
        const routesInOldVersionOfClient = {
            example: route(
                request('GET', "/old/path"),
                json<any>()
            )
        };
        const routesInNewVersionOfServer = {
            example: route(
                request('GET', "/new/path"),
                json<any>()
            )
        };

        const server = buildRouter(routesInNewVersionOfServer, {
            example: () => {
                throw new Error("Route should never be matched")
            }
        });
        const c = buildClient(routesInOldVersionOfClient, server);

        const e: Error = await catchError(() => c.example());
        expect(e.message).contains("404: /old/path Server could not find a valid route for request");
    });

    it('throws error when client lens creates an invalid request', async () => {
        const routesInOldVersionOfClient = {
            example: route(
                // Old route expects any string
                request('POST', "/path", text()),
                json<any>()
            )
        };
        const routesInNewVersionOfServer = {
            example: route(
                // Old route expects valid json
                request('POST', "/path", json<any>()),
                json<any>()
            )
        };

        const server = buildRouter(routesInNewVersionOfServer, {
            example: () => {
                throw new Error("Route should never be matched")
            }
        });
        const c = buildClient(routesInOldVersionOfClient, server);

        const e: Error = await catchError(() => c.example("noJson}"));
        expect(e.message).contains("400: /path Server could not understand request");
    });

    it('throws error when server throws unexpected exception', async () => {
        const routes = {
            example: route(
                request('GET', "/path"),
                json<any>()
            )
        };

        const server = buildRouter(routes, {
            example: () => {
                throw new Error("Server throws an exception")
            }
        });
        const c = buildClient(routes, server);

        const e: Error = await catchError(() => c.example());
        expect(e.message).contains("500: /path Server threw an exception");
    });
});
