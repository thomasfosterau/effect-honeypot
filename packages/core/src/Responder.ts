/**
 * Strategies for answering a request that tripped a trap.
 *
 * @since 0.1.0
 */
import * as Arr from "effect/Array"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Random from "effect/Random"
import * as HttpServerResponse from "effect/http/HttpServerResponse"
import type * as HttpServerRequest from "effect/http/HttpServerRequest"
import type * as Trap from "./Trap.ts"

/**
 * A request that matched a trap.
 *
 * @since 0.1.0
 * @category models
 */
export interface Hit {
  readonly trap: Trap.Trap
  readonly request: HttpServerRequest.HttpServerRequest
  /** The client identifier used for blocking, usually the remote address. */
  readonly client: Option.Option<string>
}

/**
 * @since 0.1.0
 * @category models
 */
export type Responder = (hit: Hit) => Effect.Effect<HttpServerResponse.HttpServerResponse>

/**
 * Responds with an empty body and the given status.
 *
 * @since 0.1.0
 * @category constructors
 */
export const status =
  (code: number): Responder =>
  () =>
    Effect.succeed(HttpServerResponse.empty({ status: code }))

/**
 * Pretends the endpoint does not exist.
 *
 * @since 0.1.0
 * @category constructors
 */
export const notFound: Responder = status(404)

/**
 * @since 0.1.0
 * @category constructors
 */
export const forbidden: Responder = status(403)

/**
 * Serves the trap's decoy (e.g. a fake login page) when it has one,
 * otherwise falls back to `orElse`.
 *
 * @since 0.1.0
 * @category constructors
 */
export const decoy =
  (orElse: Responder = notFound): Responder =>
  (hit) =>
    Option.match(hit.trap.decoy, {
      onNone: () => orElse(hit),
      onSome: Effect.succeed,
    })

/**
 * Responds with random bytes, for wasting a scanner's parser and bandwidth.
 *
 * @since 0.1.0
 * @category constructors
 */
export const garbage =
  (options?: { readonly minBytes?: number; readonly maxBytes?: number; readonly contentType?: string }): Responder =>
  () =>
    Effect.gen(function* () {
      const size = yield* Random.nextIntBetween(options?.minBytes ?? 256, options?.maxBytes ?? 4096)
      const bytes = yield* Effect.forEach(Arr.range(1, size), () => Random.nextIntBetween(0, 255), {
        concurrency: 1,
      })
      return HttpServerResponse.uint8Array(Uint8Array.from(bytes), {
        status: 200,
        contentType: options?.contentType ?? "text/html; charset=utf-8",
      })
    })

/**
 * Delays another responder, tying up the scanner's connection.
 *
 * Note that each delayed request also holds a fiber and a socket on this
 * server; keep delays modest, or put a connection limit in front.
 *
 * @since 0.1.0
 * @category combinators
 */
export const tarpit =
  (delay: Duration.Input, responder: Responder): Responder =>
  (hit) =>
    Effect.andThen(Effect.sleep(delay), responder(hit))

/**
 * Picks a responder at random for each hit.
 *
 * @since 0.1.0
 * @category combinators
 */
export const oneOf =
  (first: Responder, ...rest: ReadonlyArray<Responder>): Responder =>
  (hit) =>
    Effect.flatMap(Random.nextIntBetween(0, rest.length), (index) =>
      Option.getOrElse(Arr.get(rest, index - 1), () => first)(hit),
    )
