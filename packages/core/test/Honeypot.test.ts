import { describe, expect, it } from "@effect/vitest"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as HttpRouter from "effect/http/HttpRouter"
import * as HttpServerResponse from "effect/http/HttpServerResponse"
import * as TestClock from "effect/testing/TestClock"

import * as Blocklist from "../src/Blocklist.ts"
import * as Honeypot from "../src/Honeypot.ts"
import * as Responder from "../src/Responder.ts"
import * as Trap from "../src/Trap.ts"

const login = Trap.make({
  id: "test/login",
  description: "A fake login page",
  match: Trap.exact("/wp-login.php"),
  decoy: HttpServerResponse.text("decoy"),
})
const dotenv = Trap.make({ id: "test/dotenv", description: ".env", match: Trap.suffix("/.env") })

const makeHandler = (options: Partial<Honeypot.Options> = {}) => {
  const App = Layer.mergeAll(
    HttpRouter.add("GET", "/", HttpServerResponse.text("home")),
    Honeypot.layer({
      traps: [login, dotenv],
      clientId: (request) => Option.fromUndefinedOr(request.headers["x-client"]),
      onHit: () => Effect.void,
      ...options,
    }),
  ).pipe(Layer.provide(Blocklist.layerMemory))
  return HttpRouter.toWebHandler(App, { disableLogger: true })
}

const fetchFrom =
  (handler: (request: Request) => Promise<Response>) =>
  (path: string, client = "1.2.3.4") =>
    Effect.tryPromise(async () => {
      const response = await handler(new Request(`http://localhost${path}`, { headers: { "x-client": client } }))
      return { status: response.status, body: await response.text() }
    })

describe("Honeypot.layer", () => {
  it.effect("passes through ordinary requests", () =>
    Effect.gen(function* () {
      const { handler, dispose } = makeHandler()
      const get = fetchFrom(handler)
      expect(yield* get("/")).toEqual({ status: 200, body: "home" })
      yield* Effect.tryPromise(dispose)
    }),
  )

  it.effect("serves decoys, falls back to 404, then blocks the client", () =>
    Effect.gen(function* () {
      const { handler, dispose } = makeHandler()
      const get = fetchFrom(handler)
      expect(yield* get("/wp-login.php")).toEqual({ status: 200, body: "decoy" })
      expect(yield* get("/", "5.6.7.8")).toEqual({ status: 200, body: "home" })
      expect(yield* get("/", "1.2.3.4")).toEqual({ status: 403, body: "" })
      expect((yield* get("/app/.env", "9.9.9.9")).status).toBe(404)
      yield* Effect.tryPromise(dispose)
    }),
  )

  it.effect("can respond without blocking", () =>
    Effect.gen(function* () {
      const { handler, dispose } = makeHandler({ blockFor: false, respond: Responder.forbidden })
      const get = fetchFrom(handler)
      expect((yield* get("/wp-login.php")).status).toBe(403)
      expect(yield* get("/")).toEqual({ status: 200, body: "home" })
      yield* Effect.tryPromise(dispose)
    }),
  )
})

describe("Blocklist.layerMemory", () => {
  it.layer(Blocklist.layerMemory)((layerIt) => {
    layerIt.effect("expires blocks", () =>
      Effect.gen(function* () {
        const blocklist = yield* Blocklist.Blocklist
        yield* blocklist.block("client", Duration.minutes(5))
        expect(yield* blocklist.isBlocked("client")).toBe(true)
        expect(yield* blocklist.isBlocked("other")).toBe(false)
        yield* TestClock.adjust(Duration.minutes(5))
        expect(yield* blocklist.isBlocked("client")).toBe(false)
      }),
    )
  })
})
