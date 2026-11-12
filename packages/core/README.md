# @thomasfosterau/effect-honeypot-core

Traps, responders and blocklisting for Effect HTTP servers: the engine behind effect-honeypot.

## Install

```sh
pnpm add @thomasfosterau/effect-honeypot-core effect
```

## Example

```ts
import { Trap } from "@thomasfosterau/effect-honeypot-core"

export const jenkins = Trap.make({
  id: "jenkins/script-console",
  description: "Jenkins script console",
  tags: ["jenkins"],
  match: Trap.anyOf(Trap.exact("/script"), Trap.directory("/jenkins")),
})
```

## Exports

| Export      | Contents                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `Trap`      | Trap definitions and path matchers (`make`, `exact`, `directory`, `suffix`, `regex`, `anyOf`, `find`) |
| `Responder` | What a trapped client gets (`notFound`, `forbidden`, `status`, `decoy`, `garbage`, `tarpit`, `oneOf`) |
| `Blocklist` | The blocklist service, with `layerMemory` and `layerNoop`                                             |
| `Honeypot`  | `layer`, `middleware`, `httpApp` and `makeHandler`                                                    |

See the [effect-honeypot README](https://github.com/thomasfosterau/effect-honeypot#readme) and the [usage guide](https://github.com/thomasfosterau/effect-honeypot/blob/trunk/docs/usage.md) for more.
