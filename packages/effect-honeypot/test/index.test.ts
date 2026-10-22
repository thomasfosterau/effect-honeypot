import { describe, expect, it } from "@effect/vitest"
import * as Arr from "effect/Array"

import { allTraps, Common, Drupal, Honeypot, MediaWiki, WordPress } from "../src/index.ts"

describe("effect-honeypot", () => {
  it("re-exports the core engine", () => {
    expect(Honeypot.middleware).toBeTypeOf("function")
  })

  it("bundles every trap with a unique id", () => {
    const ids = Arr.map(allTraps, (trap) => trap.id)
    expect(Arr.dedupe(ids)).toEqual(ids)
    expect(allTraps).toHaveLength(
      WordPress.traps.length + Drupal.traps.length + MediaWiki.traps.length + Common.traps.length,
    )
  })
})
