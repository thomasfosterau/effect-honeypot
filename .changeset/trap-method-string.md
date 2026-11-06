---
"@thomasfosterau/effect-honeypot-core": patch
---

`Trap.test` and `Trap.find` take the request method as a `string`, so they accept `HttpServerRequest.method` as Effect 4.1 types it (a `string`, no longer narrowed to `HttpMethod`). A trap with no `methods` restriction still matches every method, non-standard ones included.
