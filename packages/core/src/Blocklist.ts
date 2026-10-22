/**
 * Tracks clients that have tripped a trap so that every subsequent request
 * from them can be refused.
 *
 * @since 0.1.0
 */
import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"

/**
 * Implement this service to share blocks between instances (Redis, a
 * database, a firewall API, ...).
 *
 * @since 0.1.0
 * @category services
 */
export class Blocklist extends Context.Service<
  Blocklist,
  {
    block(client: string, duration: Duration.Input): Effect.Effect<void>
    isBlocked(client: string): Effect.Effect<boolean>
    unblock(client: string): Effect.Effect<void>
  }
>()("@thomasfosterau/effect-honeypot-core/Blocklist") {}

/**
 * A process-local blocklist. Expired entries are pruned whenever a new
 * client is blocked.
 *
 * @since 0.1.0
 * @category layers
 */
export const layerMemory: Layer.Layer<Blocklist> = Layer.effect(
  Blocklist,
  Effect.gen(function* () {
    const entries = yield* Ref.make(HashMap.empty<string, number>())
    return Blocklist.of({
      block: Effect.fnUntraced(function* (client, duration) {
        const now = yield* Clock.currentTimeMillis
        const until = now + Duration.toMillis(duration)
        yield* Ref.update(entries, (map) =>
          HashMap.set(
            HashMap.filter(map, (expiry) => expiry > now),
            client,
            Math.max(
              until,
              Option.getOrElse(HashMap.get(map, client), () => 0),
            ),
          ),
        )
      }),
      isBlocked: Effect.fnUntraced(function* (client) {
        const now = yield* Clock.currentTimeMillis
        const map = yield* Ref.get(entries)
        return Option.exists(HashMap.get(map, client), (expiry) => expiry > now)
      }),
      unblock: (client) => Ref.update(entries, HashMap.remove(client)),
    })
  }),
)

/**
 * A blocklist that never blocks anyone: traps still respond and report, but
 * clients are not refused afterwards.
 *
 * @since 0.1.0
 * @category layers
 */
export const layerNoop: Layer.Layer<Blocklist> = Layer.succeed(Blocklist)({
  block: () => Effect.void,
  isBlocked: () => Effect.succeed(false),
  unblock: () => Effect.void,
})
