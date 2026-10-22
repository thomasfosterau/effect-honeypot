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

| Package                                            | Contents                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`effect-honeypot`](packages/effect-honeypot)      | Everything below, plus `allTraps`                                                          |
| [`@effect-honeypot/core`](packages/core)           | `Trap`, `Responder`, `Blocklist` and `Honeypot` (middleware, router layer, standalone app) |
| [`@effect-honeypot/common`](packages/common)       | Framework-agnostic probes: dotfiles, VCS metadata, credentials, dumps, admin tools         |
| [`@effect-honeypot/wordpress`](packages/wordpress) | WordPress                                                                                  |
| [`@effect-honeypot/drupal`](packages/drupal)       | Drupal                                                                                     |
| [`@effect-honeypot/mediawiki`](packages/mediawiki) | MediaWiki                                                                                  |

Install `effect-honeypot` for everything, or `@effect-honeypot/core` plus just
the trap packages you want.

## Usage

```ts
import * as Layer from "effect/Layer"
import * as HttpRouter from "effect/http/HttpRouter"
import * as HttpServerResponse from "effect/http/HttpServerResponse"
import { Blocklist, Honeypot, Responder, allTraps } from "effect-honeypot"

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
import { Trap } from "@effect-honeypot/core"

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

This repository uses [Vite+](https://viteplus.dev) (`vp`) with pnpm workspaces.

```sh
vp install          # install dependencies (also installs the pre-commit hook)
vp check            # format, lint (oxlint + @mpsuesser/oxlint-plugin-effect) and type check
vp test             # run every package's tests
vp run -r build     # build every package with `vp pack`
vp run ready        # all of the above
```

### Adding a target package

1. Copy `packages/wordpress` to `packages/<target>` and update `package.json`.
2. Export each trap and a `traps` array (most specific first) from `src/index.ts`.
3. Add tests for paths that must and must not be trapped. Avoid generic paths
   (`/login`, `/admin`, `/index.php`) that a legitimate app might serve.
4. Add the package to `packages/effect-honeypot` (dependency, re-export and `allTraps`).

### Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets):

1. Run `vp run changeset` and commit the generated file with your change.
2. On `main`, the release workflow opens a "Version packages" PR.
3. Merging that PR publishes the bumped packages to npm.
