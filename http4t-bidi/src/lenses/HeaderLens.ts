import {HttpMessage} from "@http4t/core/contract";
import {getHeaderValue} from "@http4t/core/headers";
import {setHeader} from "@http4t/core/messages";
import {success} from "@http4t/result";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {MessageLens} from "../routes";

export class HeaderLens<TMessage extends HttpMessage> implements MessageLens<string, TMessage> {
    constructor(private name: string) {
    }

    async get(output: TMessage): Promise<JsonPathResult<string>> {
        const headerValue = getHeaderValue(output.headers, this.name);
        return headerValue ? success(headerValue) : failure(`Expected header "${this.name}"`)
    }

    async set(into: TMessage, value: string): Promise<TMessage> {
        return setHeader(into, this.name, value);
    }
}