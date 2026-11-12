# @thomasfosterau/effect-honeypot-drupal

Honeypot traps for Drupal probes (user/login, CHANGELOG.txt, ...).

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot-core @thomasfosterau/effect-honeypot-drupal effect
```

## Example

```ts
import * as Layer from "effect/Layer"
import { Blocklist, Honeypot } from "@thomasfosterau/effect-honeypot-core"
import * as Drupal from "@thomasfosterau/effect-honeypot-drupal"

export const HoneypotLive = Honeypot.layer({ traps: Drupal.traps }).pipe(Layer.provide(Blocklist.layerMemory))
```

## Exports

| Export                                   | Contents                                        |
| ---------------------------------------- | ----------------------------------------------- |
| `traps`                                  | Every trap in this package, most specific first |
| `changelog`, `settings`, `core`, `files` | The individual traps                            |

See the [effect-honeypot README](https://github.com/thomasfosterau/effect-honeypot#readme) and the [usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md) for more.
