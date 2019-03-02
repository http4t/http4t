import {streamBinary} from "../bodies";
import {Body, Header, HeaderName, HttpHandler, HttpRequest, HttpResponse} from "../contract";
import {host} from "../requests";
import {Uri} from "../uri";

function readableStream(body: Body) : ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start:async controller => {
      try{
        for await(const chunk of streamBinary(body)){
          controller.enqueue(chunk);
        }
      }catch(e){
        controller.error(e);
      }
      controller.close();
    }
  });
}

async function sendBodyToRequest(body: Body | undefined, request: XMLHttpRequest) {
  if (!body)
    return request.send();
  request.send(readableStream(body));
}

export class XmlHttpHandler implements HttpHandler {
  constructor(private readonly handler: XMLHttpRequest = new XMLHttpRequest()) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    return new Promise<HttpResponse>((resolve, reject) => {
        const authority = host(request);
        const uri = Uri.modify(request.uri, {authority});
        this.handler.open(request.method, uri.toString(), true);
        this.handler.withCredentials = true;
        this.handler.responseType = 'arraybuffer';
        this.setHeaders(request.headers);
        this.handler.addEventListener("load", () => {
          resolve({
            status: this.handler.status,
            headers: this.getHeaders(),
            body: this.handler.response // TODO: there's no streaming here. OK?
          });
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
