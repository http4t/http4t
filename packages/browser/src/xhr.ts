import {bufferText, typeDescription} from "@http4t/core/bodies";
import {Header, HeaderName, HttpBody, HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {authority} from "@http4t/core/requests";
import {responseOf} from "@http4t/core/responses";
import {Uri} from "@http4t/core/uri";

function getHeaders(xhr: XMLHttpRequest): Header[] {
    return xhr.getAllResponseHeaders().split("\n").map((header) => header.split(": ") as Header);
}

const unsafeHeaders: Readonly<HeaderName[]> = ['content-length', 'host'];

function setHeaders(xhr: XMLHttpRequest, headers: readonly Header[]) {
    headers.forEach(([name, value]) => {
        if (unsafeHeaders.indexOf(name.toLowerCase()) != -1) return;
        if (typeof value == 'undefined') return;
        xhr.setRequestHeader(name, value);
    });
}

export class XmlHttpHandler implements HttpHandler {
    handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                //TODO: make sure everything that needs finalising and closing gets finalised
                const uri = Uri.modify(request.uri, {authority: authority(request)});

                xhr.open(request.method, uri.toString(), true);
                xhr.withCredentials = true;
                xhr.responseType = 'arraybuffer';
                setHeaders(xhr, request.headers);

                xhr.addEventListener("load", () => {
                    if (!(xhr.response instanceof ArrayBuffer))
                        throw new Error(`Not an ArrayBuffer ${typeDescription(xhr.response)}`);

                    resolve(responseOf(
                        xhr.status,
                        [new Uint8Array(xhr.response)],
                        ...getHeaders(xhr)));
                });

                xhr.addEventListener("error", (e) => reject(e));

                sendBodyToRequest(request.body, xhr).catch(reject);
            }
        );
    }
}

async function sendBodyToRequest(body: HttpBody | undefined, request: XMLHttpRequest) {
    if (!body)
        return request.send();

    request.send(await bufferText(body));
}
