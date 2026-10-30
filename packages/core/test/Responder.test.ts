import { assert, describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as HttpServerRequest from "effect/http/HttpServerRequest"

import * as Responder from "../src/Responder.ts"
import * as Trap from "../src/Trap.ts"

const hit: Responder.Hit = {
  trap: Trap.make({ id: "test/env", description: ".env", match: Trap.suffix("/.env") }),
  request: HttpServerRequest.fromWeb(new Request("http://localhost/.env")),
  client: Option.some("1.2.3.4"),
}

describe("Responder.garbage", () => {
  it.effect("returns between minBytes and maxBytes of bytes with the default content type", () =>
    Effect.gen(function* () {
      const response = yield* Responder.garbage({ minBytes: 8, maxBytes: 16 })(hit)
      expect(response.status).toBe(200)
      assert(response.body._tag === "Uint8Array")
      expect(response.body.body.length).toBeGreaterThanOrEqual(8)
      expect(response.body.body.length).toBeLessThanOrEqual(16)
      expect(response.body.contentType).toBe("text/html; charset=utf-8")
    }),
  )

  it.effect("honours a custom content type", () =>
    Effect.gen(function* () {
      const response = yield* Responder.garbage({ minBytes: 1, maxBytes: 2, contentType: "application/json" })(hit)
      assert(response.body._tag === "Uint8Array")
      expect(response.body.contentType).toBe("application/json")
    }),
  )

  it.effect("falls back to its default size range", () =>
    Effect.gen(function* () {
      const response = yield* Responder.garbage()(hit)
      expect(response.status).toBe(200)
    }),
  )
})
