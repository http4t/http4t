import {failure, success} from "@http4t/result";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath, ParserResult} from "./index";

class BooleanParser implements Parser<boolean> {
    parse(pathSegment: string): ParserResult<boolean> {
        switch (pathSegment.toLowerCase()) {
            case "true":
                return success(true)
            case "false":
                return success(false)
            default:
                return failure("Expected 'true' or 'false'");
        }
    }

    unparse(value: boolean): string {
        return value.toString();
    }
}

export class BooleanPath extends ParserPath<boolean> {
    constructor(base: PathMatcher<string>) {
        super(base, new BooleanParser())
    }
}