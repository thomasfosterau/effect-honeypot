# @thomasfosterau/effect-honeypot

HTTP honeypot middleware for Effect: trap, tarpit and block clients probing for WordPress, Drupal, MediaWiki and other well-known endpoints.

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot effect
```

## Example

```ts
import * as Layer from "effect/Layer"
import { Blocklist, Honeypot, allTraps } from "@thomasfosterau/effect-honeypot"

export const HoneypotLive = Honeypot.layer({ traps: allTraps }).pipe(Layer.provide(Blocklist.layerMemory))
```

## Exports

| Export                                       | Contents                                               |
| -------------------------------------------- | ------------------------------------------------------ |
| `Trap`, `Responder`, `Blocklist`, `Honeypot` | Everything from `@thomasfosterau/effect-honeypot-core` |
| `Common`, `WordPress`, `Drupal`, `MediaWiki` | The trap packages, one namespace each                  |
| `allTraps`                                   | Every bundled trap, framework-specific first           |

See the [effect-honeypot README](https://github.com/thomasfosterau/effect-honeypot#readme) and the [usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md) for more.
