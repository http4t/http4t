import {get} from "@http4t/core/requests";
import {expect} from 'chai';
import {json} from "../src/lenses/JsonLens";
import {$request} from "../src/requests";
import {route} from "../src/routes";
import {buildServer} from "../src/server";

describe('Server', () => {
  it('matches route and calls handler', async () => {
    const routes = {
      example: route(
        $request('GET', "/some/path"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const s = buildServer(routes, {example});

    const response = await s.handle(get('/'));

    expect(response.status).eq(404);
  });

  it('404 on match failure', async () => {
    const routes = {
      example: route(
        $request('GET', "/some/path"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const s = buildServer(routes, {example});

    const response = await s.handle(get('/'));

    expect(response.status).eq(404);
  });
});

