# @thomasfosterau/effect-honeypot-mediawiki

Honeypot traps for MediaWiki probes (index.php?title=Special:, api.php, LocalSettings.php, ...).

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot-core @thomasfosterau/effect-honeypot-mediawiki effect
```

## Example

```ts
import * as Layer from "effect/Layer"
import { Blocklist, Honeypot } from "@thomasfosterau/effect-honeypot-core"
import * as MediaWiki from "@thomasfosterau/effect-honeypot-mediawiki"

export const HoneypotLive = Honeypot.layer({ traps: MediaWiki.traps }).pipe(Layer.provide(Blocklist.layerMemory))
```

## Exports

| Export                                                  | Contents                                        |
| ------------------------------------------------------- | ----------------------------------------------- |
| `traps`                                                 | Every trap in this package, most specific first |
| `localSettings`, `installer`, `scripts`, `specialPages` | The individual traps                            |

See the [effect-honeypot README](https://github.com/thomasfosterau/effect-honeypot#readme) and the [usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md) for more.
