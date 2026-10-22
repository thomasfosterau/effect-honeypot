import { Trap } from "@effect-honeypot/core"
import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import * as WordPress from "../src/index.ts"

const trapFor = (url: string) =>
  Option.getOrUndefined(Option.map(Trap.find(WordPress.traps, "GET", url), (trap) => trap.id))

describe("WordPress traps", () => {
  it.each([
    ["/wp-login.php", "wordpress/login"],
    ["/blog/wp-login.php?action=register", "wordpress/login"],
    ["/xmlrpc.php", "wordpress/xmlrpc"],
    ["/wp-config.php.bak", "wordpress/config"],
    ["/wp-config.php~", "wordpress/config"],
    ["/wp-admin/", "wordpress/directories"],
    ["/wordpress/wp-content/plugins/revslider/readme.txt", "wordpress/directories"],
    ["/wp-json/wp/v2/users", "wordpress/directories"],
    ["/wp-cron.php", "wordpress/scripts"],
  ])("%s -> %s", (url, id) => {
    expect(trapFor(url)).toBe(id)
  })

  it.each(["/", "/about", "/blog/my-wp-tips", "/wp-adminx"])("%s is not trapped", (url) => {
    expect(trapFor(url)).toBeUndefined()
  })
})
