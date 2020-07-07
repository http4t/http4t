import {bufferText, typeDescription} from "@http4t/core/bodies";
import {Header, HeaderName, HttpBody, HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {authority} from "@http4t/core/requests";
import {responseOf} from "@http4t/core/responses";
import {Uri} from "@http4t/core/uri";

export class XmlHttpHandler implements HttpHandler {
    constructor(private readonly handler: XMLHttpRequest = new XMLHttpRequest()) {
    }

    handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
                //TODO: make sure everything that needs finalising and closing gets finalised
                const uri = Uri.modify(request.uri, {authority: authority(request)});

                this.handler.open(request.method, uri.toString(), true);
                this.handler.withCredentials = true;
                this.handler.responseType = 'arraybuffer';
                this.setHeaders(request.headers);

                this.handler.addEventListener("load", () => {
                    if (!(this.handler.response instanceof ArrayBuffer))
                        throw new Error(`Not an ArrayBuffer ${typeDescription(this.handler.response)}`);

                    resolve(responseOf(
                        this.handler.status,
                        [new Uint8Array(this.handler.response)],
                        ...this.getHeaders()));
                });

                this.handler.addEventListener("error", (e) => reject(e));

                sendBodyToRequest(request.body, this.handler);
            }
        );
    }

    private getHeaders(): Header[] {
        return this.handler.getAllResponseHeaders().split("\n").map((header) => header.split(": ") as Header);
    }

    private unsafeHeaders: HeaderName[] = ['content-length', 'host'];

    private setHeaders(headers: Header[]) {
        headers.forEach(([name, value]) => {
            if (this.unsafeHeaders.indexOf(name.toLowerCase()) != -1) return;
            if (typeof value == 'undefined') return;
            this.handler.setRequestHeader(name, value);
        });
    }
}

async function sendBodyToRequest(body: HttpBody | undefined, request: XMLHttpRequest) {
    if (!body)
        return request.send();

    request.send(await bufferText(body));
}
