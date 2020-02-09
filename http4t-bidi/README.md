# Bi-directional routing

## Goals

### HTTP routes that can be shared by clients and server

I should be able to define a route at `GET /widgets/{id}` and use that route to both:

* Match a request on the server side, then route it to a handler function
* Create a request on the client side and pass it to an `HttpHandler`

By sharing the routes between client and server I avoid bugs with my client
sending the wrong shaped requests to my server.

### Fully type-safe contracts for both client and server

If I have a route `GET /widgets/{widgetId}` that returns a `Widget`, I want to be able
to give my server a handler function that knows nothing about http, like:

```typescript
(args: {widgetId: string}) => Promise<Widget>
```

...and have the server destructure the request into that shape and then serialise
the function result into an `HttpResponse`.

On the client side, I want to be able to generate a function with the same signature
that takes care of serialising to an `HttpRequest`, sending to an `HttpHandler`, then
deserialising from `HttpResponse`.

## Examples

See [client.test.ts](test/client.test.ts) for an example of a complete round trip
from client to server and back.
