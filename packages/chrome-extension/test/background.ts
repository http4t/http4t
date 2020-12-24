import {findTabByHost, SendToTabHandler, startBackgroundListener} from "@http4t/chrome-extension/background";
import {LoggingHttpHandler} from "@http4t/core/LoggingHttpHandler";

startBackgroundListener(new LoggingHttpHandler(new SendToTabHandler(findTabByHost)))
