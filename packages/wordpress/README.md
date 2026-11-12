# @thomasfosterau/effect-honeypot-wordpress

Honeypot traps for WordPress probes (wp-login.php, xmlrpc.php, wp-admin, ...).

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot-core @thomasfosterau/effect-honeypot-wordpress effect
```

## Example

```ts
import * as Layer from "effect/Layer"
import { Blocklist, Honeypot } from "@thomasfosterau/effect-honeypot-core"
import * as WordPress from "@thomasfosterau/effect-honeypot-wordpress"

export const HoneypotLive = Honeypot.layer({ traps: WordPress.traps }).pipe(Layer.provide(Blocklist.layerMemory))
```

## Exports

| Export                                                | Contents                                        |
| ----------------------------------------------------- | ----------------------------------------------- |
| `traps`                                               | Every trap in this package, most specific first |
| `login`, `xmlrpc`, `directories`, `config`, `scripts` | The individual traps                            |

See the [effect-honeypot README](https://github.com/thomasfosterau/effect-honeypot#readme) and the [usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md) for more.
