# @thomasfosterau/effect-honeypot-core

## 0.1.0

### Minor Changes

- [#1](https://github.com/thomasfosterau/effect-honeypot/pull/1) [`ec76a1d`](https://github.com/thomasfosterau/effect-honeypot/commit/ec76a1d3995e7b324fef2ce4adc568efd223e2a0) Thanks [@thomasfosterau](https://github.com/thomasfosterau)! - Initial release: trap definitions, responders (decoy, garbage, tarpit, ...), an in-memory blocklist, and HTTP middleware / router layer / standalone app constructors, plus trap sets for WordPress, Drupal, MediaWiki and common framework-agnostic probes.

### Patch Changes

- [#13](https://github.com/thomasfosterau/effect-honeypot/pull/13) [`a9ecf22`](https://github.com/thomasfosterau/effect-honeypot/commit/a9ecf22fd9e3533095886bcc2304e87e1d6b945a) Thanks [@thomasfosterau](https://github.com/thomasfosterau)! - `Trap.test` and `Trap.find` take the request method as a `string`, so they accept `HttpServerRequest.method` as Effect 4.1 types it (a `string`, no longer narrowed to `HttpMethod`). A trap with no `methods` restriction still matches every method, non-standard ones included.
