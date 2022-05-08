import {SendToTabHandler, startBackgroundListener} from "@http4t/chrome-extension/background";
import {LoggingHttpHandler} from "@http4t/core/LoggingHttpHandler";
import {findTabByHost} from "@http4t/chrome-extension/util/tabs";

startBackgroundListener(new LoggingHttpHandler(new SendToTabHandler(findTabByHost)))
