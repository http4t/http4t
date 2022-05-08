import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, routeFailed} from "../lenses";
import {mapped} from "./MapLens";
import {header} from "./HeaderLens";
import {responseOf} from "@http4t/core/responses";
import {success} from "@http4t/result";

export function bearerAuthHeader<TMessage extends HttpMessage = HttpMessage>(): MessageLens<TMessage, string> {
    return mapped(
        header("Authentication"),
        async authHeader => {
            return !authHeader.startsWith("Bearer ")
                ? routeFailed(
                    "Authentication header did not begin 'Bearer '",
                    ["headers", "Authentication"],
                    responseOf(403))
                : success(authHeader.replace(/Bearer\s+/, ""));

        },
        token => `Bearer ${token}`)
}