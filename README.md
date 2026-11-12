# effect-honeypot 🍯

HTTP honeypot middleware, router layers and apps for [Effect](https://effect.website).

Vulnerability scanners hammer every public server with requests for
`/wp-login.php`, `/.env`, `/.git/config`, `/phpmyadmin/` and thousands of other
well-known paths. If your app is not WordPress (or PHP at all), those requests
can only come from someone probing for a weakness. `effect-honeypot` recognises
them and lets you decide what happens next:

- **block** the client for a while, so the rest of its scan gets nothing
- serve a **decoy** (a fake WordPress login page, a fake `.env`) to keep it busy
- send back **garbage** bytes, or **tarpit** it with a slow response
- **report** the hit (logs by default; plug in metrics, alerts, a firewall API...)

## Packages

| Package                                                           | Contents                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`@thomasfosterau/effect-honeypot`](packages/effect-honeypot)     | Everything below, plus `allTraps`                                                          |
| [`@thomasfosterau/effect-honeypot-core`](packages/core)           | `Trap`, `Responder`, `Blocklist` and `Honeypot` (middleware, router layer, standalone app) |
| [`@thomasfosterau/effect-honeypot-common`](packages/common)       | Framework-agnostic probes: dotfiles, VCS metadata, credentials, dumps, admin tools         |
| [`@thomasfosterau/effect-honeypot-wordpress`](packages/wordpress) | WordPress                                                                                  |
| [`@thomasfosterau/effect-honeypot-drupal`](packages/drupal)       | Drupal                                                                                     |
| [`@thomasfosterau/effect-honeypot-mediawiki`](packages/mediawiki) | MediaWiki                                                                                  |

Install `@thomasfosterau/effect-honeypot` for everything, or `@thomasfosterau/effect-honeypot-core` plus just
the trap packages you want.

## Usage

```ts
import * as Layer from "effect/Layer"
import * as HttpRouter from "effect/http/HttpRouter"
import * as HttpServerResponse from "effect/http/HttpServerResponse"
import { Blocklist, Honeypot, Responder, allTraps } from "@thomasfosterau/effect-honeypot"

const Routes = HttpRouter.add("GET", "/", HttpServerResponse.text("Hello, human."))

const HoneypotLive = Honeypot.layer({
  traps: allTraps,
  respond: Responder.tarpit("3 seconds", Responder.decoy(Responder.garbage())),
  blockFor: "1 hour",
}).pipe(Layer.provide(Blocklist.layerMemory))

export const App = Layer.mergeAll(Routes, HoneypotLive)
```

`Honeypot.layer` installs global router middleware, so it also sees requests
that match no route. There is also:

- `Honeypot.middleware(options)` – plain `HttpMiddleware`-style function for any
  `HttpServerRequest` app
- `Honeypot.httpApp(options)` – a standalone app (404 for everything else), e.g.
  for a dedicated decoy server
- `Honeypot.makeHandler(options)` – the underlying request → `Option<response>`
  function, for other integrations

See [`examples/node-server`](examples/node-server/src/main.ts) for a runnable
Node server.

### Defining traps

```ts
import { Trap } from "@thomasfosterau/effect-honeypot-core"

export const jenkins = Trap.make({
  id: "jenkins/script-console",
  description: "Jenkins script console",
  tags: ["jenkins"],
  match: Trap.anyOf(Trap.exact("/script"), Trap.directory("/jenkins")),
})
```

Paths are normalised before matching (query string dropped, percent-decoded,
lower-cased, slashes collapsed), so write matchers in lower case.

Behind a reverse proxy, either apply `HttpMiddleware.xForwardedHeaders` or pass
your own `clientId` so blocks apply to the real client, not the proxy.

## Development

See [CONTRIBUTING.md](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/CONTRIBUTING.md) for setup, the gates, adding a target package and releasing.
