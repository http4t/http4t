/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { Body } from "@http4t/core/contract";
export declare function bodyToStream(body: Body, stream: Writable): Promise<void>;
export declare function streamToBody(stream: Readable): Body;
