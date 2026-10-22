import { Trap } from "@effect-honeypot/core"
import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import * as Common from "../src/index.ts"

const trapFor = (url: string) =>
  Option.getOrUndefined(Option.map(Trap.find(Common.traps, "GET", url), (trap) => trap.id))

describe("common traps", () => {
  it.each([
    ["/.env", "common/dotenv"],
    ["/api/.env.production", "common/dotenv"],
    ["/.git/config", "common/version-control"],
    ["/.git/HEAD", "common/version-control"],
    ["/.svn/entries", "common/version-control"],
    ["/.aws/credentials", "common/credentials"],
    ["/.vscode/sftp.json", "common/credentials"],
    ["/.DS_Store", "common/server-config"],
    ["/server-status", "common/server-config"],
    ["/backup.zip", "common/backups"],
    ["/dump.sql.gz", "common/backups"],
    ["/phpinfo.php", "common/phpinfo"],
    ["/phpMyAdmin/index.php", "common/admin-tools"],
    ["/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php", "common/exploits"],
    ["/cgi-bin/luci", "common/exploits"],
    ["/actuator/env", "common/exploits"],
  ])("%s -> %s", (url, id) => {
    expect(trapFor(url)).toBe(id)
  })

  it.each(["/", "/environment", "/.well-known/security.txt", "/github", "/downloads/app.zip", "/index.php"])(
    "%s is not trapped",
    (url) => {
      expect(trapFor(url)).toBeUndefined()
    },
  )

  it("php is opt-in", () => {
    expect(Common.traps).not.toContain(Common.php)
    expect(Common.php.matches("/index.php")).toBe(true)
  })
})
