import { HttpHandler } from "../src/contract";
export declare function handlerContract(factory: () => Promise<HttpHandler>, host?: Promise<string>): void;
