import {bufferText} from "@http4t/core/bodies";
import {Header, HttpHandler, HttpResponse} from "@http4t/core/contract";
import {Uri} from "@http4t/core/uri";
import {APIGatewayProxyEventBase, APIGatewayProxyResult} from "aws-lambda"

function toHttpRequest(event: APIGatewayProxyEventBase<any>) {
    return {
        method: event.httpMethod.toUpperCase(),
        uri: Uri.parse(event.path),
        headers: [
            ...Object.entries(event.headers),
            ...Object.entries(event.multiValueHeaders)
                .flatMap(([n, values]) =>
                    values.map(v => [n, v] as Header))
        ],
        body: event.body || ""
    };
}

function addHeader(mutateResponse: APIGatewayProxyResult, [n, v]: Header): APIGatewayProxyResult {
    if (mutateResponse.headers?.hasOwnProperty(n)) {
        const existing = delete mutateResponse.headers[n];
        if (!mutateResponse.multiValueHeaders) mutateResponse.multiValueHeaders = {};
        mutateResponse.multiValueHeaders[n] = [existing, v];

    } else if (mutateResponse.multiValueHeaders?.hasOwnProperty(n)) {
        mutateResponse.multiValueHeaders[n].push(v);

    } else {
        if (!mutateResponse.headers) mutateResponse.headers = {};
        mutateResponse.headers[n] = v;
    }

    return mutateResponse;
}

async function toGatewayResult(response: HttpResponse): Promise<APIGatewayProxyResult> {
    return response.headers.reduce(addHeader,
        {
            statusCode: response.status,
            body: await bufferText(response.body)
        });
}

export function lambda(handler: HttpHandler) {
    return async (event: APIGatewayProxyEventBase<any>): Promise<APIGatewayProxyResult> => {
        const request = toHttpRequest(event);
        const response = await handler.handle(request);
        return await toGatewayResult(response);
    }
}
