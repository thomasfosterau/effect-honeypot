# Using effect-honeypot

Every option and export is documented in the doc comments of [`packages/core/src`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/core/src); this page covers what does not fit there.

## Mounting the honeypot

`Honeypot.layer(options)` installs global router middleware, so it also sees
requests that match no route (the example in the
[README](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/README.md#example)). There is also:

- `Honeypot.middleware(options)` – plain `HttpMiddleware`-style function for any
  `HttpServerRequest` app
- `Honeypot.httpApp(options)` – a standalone app (404 for everything else), e.g.
  for a dedicated decoy server
- `Honeypot.makeHandler(options)` – the underlying request → `Option<response>`
  function, for other integrations

## Defining traps

```ts
import { Trap } from "@thomasfosterau/effect-honeypot-core"

export const jenkins = Trap.make({
  id: "jenkins/script-console",
  description: "Jenkins script console",
  tags: ["jenkins"],
  match: Trap.anyOf(Trap.exact("/script"), Trap.directory("/jenkins")),
})
```

## Path normalisation

Paths are normalised before matching (query string dropped, percent-decoded,
lower-cased, slashes collapsed), so write matchers in lower case.

## Behind a reverse proxy

Behind a reverse proxy, either apply `HttpMiddleware.xForwardedHeaders` or pass
your own `clientId` so blocks apply to the real client, not the proxy.
