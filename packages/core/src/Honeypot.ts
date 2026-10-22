/**
 * Wires traps, responders and the blocklist into HTTP middleware, router
 * layers and standalone apps.
 *
 * @since 0.1.0
 */
import * as Arr from "effect/Array"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import type * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as HttpRouter from "effect/http/HttpRouter"
import * as HttpServerRequest from "effect/http/HttpServerRequest"
import * as HttpServerResponse from "effect/http/HttpServerResponse"
import { Blocklist } from "./Blocklist.ts"
import * as Responder from "./Responder.ts"
import * as Trap from "./Trap.ts"

/**
 * @since 0.1.0
 * @category models
 */
export interface Options {
  readonly traps: Iterable<Trap.Trap>
  /** How to answer a request that hit a trap. Defaults to `Responder.decoy(Responder.notFound)`. */
  readonly respond?: Responder.Responder
  /** How long to block a client after a hit. `false` disables blocking. Defaults to one hour. */
  readonly blockFor?: Duration.Input | false
  /** How to answer any request from a blocked client. Defaults to an empty 403. */
  readonly blocked?: (
    request: HttpServerRequest.HttpServerRequest,
  ) => Effect.Effect<HttpServerResponse.HttpServerResponse>
  /**
   * Identifies the client for blocking. Defaults to the request's remote
   * address; behind a proxy, use `HttpMiddleware.xForwardedHeaders` or supply
   * your own.
   */
  readonly clientId?: (request: HttpServerRequest.HttpServerRequest) => Option.Option<string>
  /** Called for every hit, e.g. to report it. Defaults to logging a warning. */
  readonly onHit?: (hit: Responder.Hit) => Effect.Effect<void>
}

/**
 * Handles a single request: returns a response when the client is blocked or
 * the request hit a trap, and `None` when it should be passed through.
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeHandler = (
  options: Options,
): ((
  request: HttpServerRequest.HttpServerRequest,
) => Effect.Effect<Option.Option<HttpServerResponse.HttpServerResponse>, never, Blocklist>) => {
  const traps = Arr.fromIterable(options.traps)
  const respond = options.respond ?? Responder.decoy()
  const blockFor = options.blockFor ?? Duration.hours(1)
  const blocked = options.blocked ?? (() => Effect.succeed(HttpServerResponse.empty({ status: 403 })))
  const clientId = options.clientId ?? ((request) => request.remoteAddress)
  const onHit = options.onHit ?? logHit

  return Effect.fnUntraced(function* (request) {
    const blocklist = yield* Blocklist
    const client = clientId(request)
    const isBlocked = yield* Option.match(client, {
      onNone: () => Effect.succeed(false),
      onSome: (id) => blocklist.isBlocked(id),
    })
    if (isBlocked) {
      return Option.some(yield* blocked(request))
    }
    const trap = Trap.find(traps, request.method, request.url)
    if (Option.isNone(trap)) {
      return Option.none()
    }
    const hit: Responder.Hit = { trap: trap.value, request, client }
    yield* onHit(hit)
    if (blockFor !== false && Option.isSome(client)) {
      yield* blocklist.block(client.value, blockFor)
    }
    return Option.some(yield* respond(hit))
  })
}

/**
 * HTTP middleware that answers trapped and blocked requests itself and passes
 * everything else through to the wrapped app.
 *
 * @since 0.1.0
 * @category middleware
 */
export const middleware = (
  options: Options,
): (<E, R>(
  app: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R | HttpServerRequest.HttpServerRequest | Blocklist>) => {
  const handle = makeHandler(options)
  return (app) =>
    HttpServerRequest.HttpServerRequest.pipe(
      Effect.flatMap(handle),
      Effect.flatMap(
        Option.match({
          onNone: () => app,
          onSome: Effect.succeed,
        }),
      ),
    )
}

/**
 * Installs the honeypot as global middleware on the `HttpRouter`, so it also
 * sees requests that match no route.
 *
 * @since 0.1.0
 * @category layers
 */
export const layer = (options: Options): Layer.Layer<never, never, HttpRouter.HttpRouter | Blocklist> =>
  HttpRouter.middleware(
    Effect.gen(function* () {
      const blocklist = yield* Blocklist
      const apply = middleware(options)
      return (app) => Effect.provideService(apply(app), Blocklist, blocklist)
    }),
    { global: true },
  )

/**
 * A standalone honeypot app, e.g. for a dedicated decoy server: trapped and
 * blocked requests are handled as usual and everything else gets `fallback`
 * (an empty 404 by default).
 *
 * @since 0.1.0
 * @category apps
 */
export const httpApp = (
  options: Options & {
    readonly fallback?: Effect.Effect<HttpServerResponse.HttpServerResponse>
  },
): Effect.Effect<HttpServerResponse.HttpServerResponse, never, HttpServerRequest.HttpServerRequest | Blocklist> =>
  middleware(options)(options.fallback ?? Effect.succeed(HttpServerResponse.empty({ status: 404 })))

const logHit = (hit: Responder.Hit): Effect.Effect<void> =>
  Effect.logWarning("Honeypot trap hit").pipe(
    Effect.annotateLogs({
      trap: hit.trap.id,
      method: hit.request.method,
      url: hit.request.url,
      client: Option.getOrElse(hit.client, () => "unknown"),
    }),
  )
