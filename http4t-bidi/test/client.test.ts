import {HttpRequest, HttpResponse} from "@http4t/core/contract";
import {setBody} from "@http4t/core/messages";
import {failure, Result} from "@http4t/result";
import {expect} from 'chai';
import {buildClient} from "../src/client";
import {json} from "../src/lenses/JsonLens";
import {named} from "../src/lenses/NamedLenses";
import {path} from "../src/paths";
import {v, VariablePaths} from "../src/paths/variables";
import {request} from "../src/requests";
import {route} from "../src/routes";
import {buildServer} from "../src/server";

async function catchError(fn: () => any): Promise<any> {
  try {
    await fn();
    return;
  } catch (e) {
    return e;
  }
}

describe('Client', () => {
  it('serialises request, sends to http handler, and then deserialises response', async () => {
    const routes = {
      example: route(
        request('GET', "/some/path"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const server = buildServer(routes, {example});
    const client = buildClient(routes, server);

    expect(await client.example({})).deep.eq("hello world");
  });

  it('supports root path', async () => {
    const routes = {
      example: route(
        request('GET', "/"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const server = buildServer(routes, {example});
    const client = buildClient(routes, server);

    expect(await client.example({})).deep.eq("hello world");
  });

  it('supports path variables', async () => {
    type GetUserAccounts = {
      readonly username: string
    }
    type CreateAccount = {
      readonly username: string,
      readonly account: Account
    }
    type Account = {
      readonly name: string
    }
    type UserAccounts = {
      readonly accounts: Account[]
    }

    const paths: VariablePaths<GetUserAccounts> = {
      username: v.segment
    };

    const routes = {
      userAccounts: route(
        request('GET', path(paths, v => ["accounts/", v.username])),
        json<UserAccounts>()
      ),
      createAccount: route(
        request(
          'POST',
          path({username: v.segment}, v => ["accounts/", v.username]),
          named({account: json<Account, HttpRequest>()})),

        json<Account>()
      )
    };

    const accounts: { [username: string]: Account[] } = {};

    async function userAccounts(request: GetUserAccounts): Promise<UserAccounts> {
      return {accounts: accounts[request.username] || []};
    }

    async function createAccount(request: CreateAccount): Promise<Account> {
      if (!accounts[request.username]) accounts[request.username] = [];
      accounts[request.username].push(request.account)
      return request.account;
    }

    const server = buildServer(routes, {userAccounts, createAccount});
    const client = buildClient(routes, server);

    expect(await client.userAccounts({username: "bob"})).deep.eq({accounts: []});

    const createdAccount = {name: "bob's awesome account"};
    expect(await client.createAccount({
      username: "bob",
      account: createdAccount
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

    const server = buildServer(routes, {example});
    const client = buildClient(routes, server);

    expect(await client.example({path: ["some", "long", "path"]}))
      .deep.eq({path: ["some", "long", "path"]});
  });

  it('throws ResultError on response lens failure', async () => {
    const routes = {
      example: route(
        request('GET', "/some/path"),
        {
          inject: async (input: string, output: HttpResponse): Promise<HttpResponse> => {
            return setBody(output, input)
          },
          extract: async (): Promise<Result<string>> => {
            return failure("response lens failed", ["body"])
          }
        }
      )
    };

    async function example(): Promise<string> {
      return "hello world";
    }

    const httpHandler = buildServer(routes, {example});
    const c = buildClient(routes, httpHandler);

    const e = await catchError(() => c.example({}));
    expect(e.actual).deep.eq({
      "status": 200,
      "headers": [],
      "body": "hello world",
    });
    expect(e.expected).deep.eq({
      "status": 200,
      "headers": [],
      "body": "response lens failed",
    });
  });
});