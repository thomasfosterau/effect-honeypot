import { Trap } from "@thomasfosterau/effect-honeypot-core"
import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import * as MediaWiki from "../src/index.ts"

const trapFor = (url: string) =>
  Option.getOrUndefined(Option.map(Trap.find(MediaWiki.traps, "GET", url), (trap) => trap.id))

describe("MediaWiki traps", () => {
  it.each([
    ["/LocalSettings.php", "mediawiki/local-settings"],
    ["/w/LocalSettings.php.bak", "mediawiki/local-settings"],
    ["/mw-config/index.php", "mediawiki/installer"],
    ["/w/api.php?action=query&meta=siteinfo", "mediawiki/scripts"],
    ["/wiki/Special:Version", "mediawiki/special-pages"],
  ])("%s -> %s", (url, id) => {
    expect(trapFor(url)).toBe(id)
  })

  it.each(["/", "/index.php", "/api.php", "/wiki/Main_Page"])("%s is not trapped", (url) => {
    expect(trapFor(url)).toBeUndefined()
  })
})
