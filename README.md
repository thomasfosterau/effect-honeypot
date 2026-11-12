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

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot effect
```

That is everything. For a smaller install, take `@thomasfosterau/effect-honeypot-core` plus only the trap packages you want.

## Example

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

A runnable Node server is in [`examples/node-server`](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/examples/node-server/src/main.ts).

## Packages

| Package                                                                                                                        | Contents                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [`@thomasfosterau/effect-honeypot`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/effect-honeypot)     | Everything below, plus `allTraps`                                                          |
| [`@thomasfosterau/effect-honeypot-core`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/core)           | `Trap`, `Responder`, `Blocklist` and `Honeypot` (middleware, router layer, standalone app) |
| [`@thomasfosterau/effect-honeypot-common`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/common)       | Framework-agnostic probes: dotfiles, VCS metadata, credentials, dumps, admin tools         |
| [`@thomasfosterau/effect-honeypot-wordpress`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/wordpress) | WordPress                                                                                  |
| [`@thomasfosterau/effect-honeypot-drupal`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/drupal)       | Drupal                                                                                     |
| [`@thomasfosterau/effect-honeypot-mediawiki`](https://github.com/thomasfosterau/effect-honeypot/tree/trunk/packages/mediawiki) | MediaWiki                                                                                  |

## More

- [Usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md): the other ways to mount the honeypot, defining your own traps, path normalisation and running behind a proxy.
- [Contributing](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/CONTRIBUTING.md): setup, the gates, adding a target package and releasing.
