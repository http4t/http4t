import {SendToTabHandler, startBackgroundListener} from "@http4t/chrome-extension/background";
import {findTabByHost} from "@http4t/chrome-extension/tabs";
import {LoggingHttpHandler} from "@http4t/core/LoggingHttpHandler";

startBackgroundListener(new LoggingHttpHandler(new SendToTabHandler(findTabByHost)))
