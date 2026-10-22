import { createServer } from "node:http"

import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as Layer from "effect/Layer"
import * as HttpRouter from "effect/http/HttpRouter"
import * as HttpServerResponse from "effect/http/HttpServerResponse"
import { Blocklist, Honeypot, Responder, allTraps } from "@thomasfosterau/effect-honeypot"

const Routes = HttpRouter.add("GET", "/", HttpServerResponse.text("Hello, human."))

const HoneypotLive = Honeypot.layer({
  traps: allTraps,
  // Serve the trap's decoy (or random bytes) after making the scanner wait.
  respond: Responder.tarpit("3 seconds", Responder.decoy(Responder.garbage())),
  blockFor: "1 hour",
}).pipe(Layer.provide(Blocklist.layerMemory))

HttpRouter.serve(Layer.mergeAll(Routes, HoneypotLive)).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
  Layer.launch,
  NodeRuntime.runMain,
)
