export enum Http4tHeaders {
    /**
     * See {@link Http4tRouteResult}
     */
    ROUTE_RESULT = "Http4t-RouteResult",
    /**
     * The name of the route the request was matched against
     */
    DEBUG_MATCHED_ROUTE = "Http4t-MatchedRoute",
    /**
     * ISO-formatted date the router began matching the request
     */
    DEBUG_START_TIME = "Http4t-StartTime",
    DEBUG_END_TIME = "Http4t-EndTime"
}

export enum Http4tRouteResult {
    /**
     * The request matched a route and a response was successfully created
     */
    SUCCESS = "Success",

    /**
     * The request was not valid- the request lenses were unable to parse it
     */
    CLIENT_ERROR = "ClientError",

    // No matching route was found
    NO_MATCH = "NoMatch",

    // No matching route was found
    SERVER_ERROR = "ServerError",
}