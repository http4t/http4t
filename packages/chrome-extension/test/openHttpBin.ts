import {FetchViaBackgroundScript} from "@http4t/chrome-extension/FetchViaBackgroundScript";
import {LoggingHttpHandler} from "@http4t/core/LoggingHttpHandler";
import {requestOf} from "@http4t/core/requests";

new LoggingHttpHandler(new FetchViaBackgroundScript())
    .handle(requestOf("GET", "https://httpbin.org/get"))
    .then(console.log)
    .catch(err=>console.error("MOO"+err))
