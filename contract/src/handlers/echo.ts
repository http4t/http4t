import {Bodies} from "../bodies/Bodies";
import {HttpRequest} from "../contract";
import {ok} from "../responses";
import {handler} from "./function";

async function echoReponseBody({uri, headers, body}: HttpRequest): Promise<string> {
  const data = await (body ? Bodies.text(body) : undefined);
  return JSON.stringify({uri, data, headers});
}

export const echoMessage = handler(async (r: HttpRequest) => ok([], await echoReponseBody(r)));