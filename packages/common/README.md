# @thomasfosterau/effect-honeypot-common

Honeypot traps for framework-agnostic probes: dotfiles, VCS metadata, backups, admin panels and more.

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot-core @thomasfosterau/effect-honeypot-common effect
```

## Example

```ts
import * as Layer from "effect/Layer"
import { Blocklist, Honeypot } from "@thomasfosterau/effect-honeypot-core"
import * as Common from "@thomasfosterau/effect-honeypot-common"

export const HoneypotLive = Honeypot.layer({ traps: Common.traps }).pipe(Layer.provide(Blocklist.layerMemory))
```

## Exports

| Export                                                                                                           | Contents                                        |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `traps`                                                                                                          | Every trap in this package, most specific first |
| `dotenv`, `versionControl`, `credentials`, `serverConfig`, `backups`, `phpinfo`, `adminTools`, `exploits`, `php` | The individual traps                            |

See the [effect-honeypot README](https://github.com/thomasfosterau/effect-honeypot#readme) and the [usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md) for more.
