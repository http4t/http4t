import {HttpResponse} from "@http4t/core/contract";
import {setBody} from "@http4t/core/messages";
import {failure, Result} from "@http4t/result";
import {expect} from 'chai';
import {buildClient} from "../src/client";
import {json} from "../src/lenses/JsonLens";
import {$request} from "../src/requests";
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
        $request('GET', "/some/path"),
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

  it('throws ResultError on response lens failure', async () => {
    const routes = {
      example: route(
        $request('GET', "/some/path"),
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