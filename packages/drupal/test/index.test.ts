import { Trap } from "@effect-honeypot/core"
import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import * as Drupal from "../src/index.ts"

const trapFor = (url: string) =>
  Option.getOrUndefined(Option.map(Trap.find(Drupal.traps, "GET", url), (trap) => trap.id))

describe("Drupal traps", () => {
  it.each([
    ["/CHANGELOG.txt", "drupal/changelog"],
    ["/core/CHANGELOG.txt", "drupal/changelog"],
    ["/sites/default/settings.php", "drupal/settings"],
    ["/sites/example.com/settings.php.save", "drupal/settings"],
    ["/core/install.php", "drupal/core"],
    ["/core/modules/system/system.info.yml", "drupal/core"],
    ["/sites/default/files/backup.tar.gz", "drupal/files"],
  ])("%s -> %s", (url, id) => {
    expect(trapFor(url)).toBe(id)
  })

  it.each(["/", "/user/login", "/node/1", "/core"])("%s is not trapped", (url) => {
    expect(trapFor(url)).toBeUndefined()
  })
})
