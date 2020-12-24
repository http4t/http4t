import {FetchHandler} from "@http4t/browser/fetch";
import {startContentPageListener} from "@http4t/chrome-extension/content";
import {LoggingHttpHandler} from "@http4t/core/LoggingHttpHandler";

startContentPageListener(new LoggingHttpHandler(new FetchHandler()))
