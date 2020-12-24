import {FetchHandler} from "@http4t/browser/fetch";
import {startContentScriptListener} from "@http4t/chrome-extension/content";
import {LoggingHttpHandler} from "@http4t/core/LoggingHttpHandler";

startContentScriptListener(new LoggingHttpHandler(new FetchHandler()))
