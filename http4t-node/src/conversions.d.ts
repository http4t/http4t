/// <reference types="node" />
import * as node from 'http';
import { HttpRequest, HttpResponse } from "@http4t/core/contract";
export declare function requestHttp4tToNode(request: HttpRequest): node.RequestOptions;
export declare function requestNodeToHttp4t(nodeRequest: node.IncomingMessage): HttpRequest;
export declare function responseHttp4tToNode(response: HttpResponse, nodeResponse: node.ServerResponse): void;
export declare function responseNodeToHttp4t(nodeResponse: node.IncomingMessage): HttpResponse;
