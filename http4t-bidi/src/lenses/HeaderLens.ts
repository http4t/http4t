import {HttpMessage} from "@http4t/core/contract";
import {MessageLens} from "../routes";
import {failure, Result, success} from "@http4t/result";
import {getHeaderValue} from "@http4t/core/headers";
import {setHeader} from "@http4t/core/messages";

export class HeaderLens<TMessage extends HttpMessage> implements MessageLens<string, TMessage> {
    constructor(private name: string) {
    }

    async extract(output: TMessage): Promise<Result<string>> {
        const headerValue = getHeaderValue(output.headers, this.name);
        return headerValue ? success(headerValue) : failure(`Expected header "${this.name}"`)
    }

    async inject(input: string, output: TMessage): Promise<TMessage> {
        return setHeader(output, this.name, input);
    }
}