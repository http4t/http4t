import {HttpMessage, HttpResponse} from "@http4t/core/contract";
import {get} from "@http4t/core/requests";
import {response} from "@http4t/core/responses";
import {failure} from "@http4t/result";
import {expect} from 'chai';
import {json} from "../src/lenses/JsonLens";
import {nothing} from "../src/lenses/NothingLens";
import {request} from "../src/requests";
import {buildRouter} from "../src/router";
import {MessageLens, route, routeFailed, RoutingResult} from "../src/routes";

export class AlwaysFaillLens<TMessage extends HttpMessage> implements MessageLens<TMessage, undefined> {
  constructor(private readonly message: string, private readonly response: HttpResponse) {

  }

  async get(message: TMessage): Promise<RoutingResult<undefined>> {
    return routeFailed(this.message, this.response);
  }

  async set(into: TMessage, value: undefined): Promise<TMessage> {
    return into;
  }
}

function alwaysFail<TMessage extends HttpMessage>(expectedFailure: string): MessageLens<TMessage, undefined> {
  return new AlwaysFaillLens(expectedFailure, response(400));
}

describe('Server', () => {
  it('matches route and calls handler', async () => {
    const routes = {
      example: route(
        request('GET', "/some/path"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const s = buildRouter(routes, {example});

    const response = await s.handle(get('/'));

    expect(response.status).eq(404);
  });

  it('ignores trailing slashes in url', async () => {
    const routes = {
      example: route(
        request('GET', "/some/path"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const s = buildRouter(routes, {example});

    const response = await s.handle(get('/some/path/'));

    expect(response.status).eq(200);
  });

  it('404 on match failure', async () => {
    const routes = {
      example: route(
        request('GET', "/some/path"),
        json()
      )
    };

    async function example(): Promise<string> {
      return "hello world"
    }

    const s = buildRouter(routes, {example});

    const response = await s.handle(get('/'));

    expect(response.status).eq(404);
  });

  it('short circuits as soon as a route fails (as opposed to just not matching the request)', async () => {
    const routes = {
      fails: route(
        alwaysFail("expected failure"),
        nothing()
      ),
      doesNotGetHit: route(nothing(), nothing())
    };

    const behaviourIsNeverUsed = {} as any;
    const s = buildRouter(routes, behaviourIsNeverUsed);

    const response = await s.handle(get('/'));

    expect(response.status).eq(400);
  });
});

