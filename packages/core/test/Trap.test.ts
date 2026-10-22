import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import * as Trap from "../src/Trap.ts"

describe("Trap.normalizePath", () => {
  it.each([
    ["/", "/"],
    ["", "/"],
    ["/wp-login.php?redirect_to=x", "/wp-login.php"],
    ["//WP-LOGIN.php", "/wp-login.php"],
    ["/%2eenv", "/.env"],
    ["/wp-admin/", "/wp-admin"],
    ["\\.git\\config", "/.git/config"],
    ["/bad%E0%A4%A", "/bad%e0%a4%a"],
    ["/page#fragment", "/page"],
  ])("%s -> %s", (input, expected) => {
    expect(Trap.normalizePath(input)).toBe(expected)
  })
})

describe("matchers", () => {
  it("exact", () => {
    const matcher = Trap.exact("/Foo.php")
    expect(matcher("/foo.php")).toBe(true)
    expect(matcher("/foo.php/bar")).toBe(false)
  })

  it("directory", () => {
    const matcher = Trap.directory("/wp-admin/")
    expect(matcher("/wp-admin")).toBe(true)
    expect(matcher("/wp-admin/install.php")).toBe(true)
    expect(matcher("/wp-administrator")).toBe(false)
  })

  it("suffix", () => {
    const matcher = Trap.suffix("/XMLRPC.php")
    expect(matcher("/blog/xmlrpc.php")).toBe(true)
    expect(matcher("/notxmlrpc.php")).toBe(false)
  })
})

describe("Trap.find", () => {
  const login = Trap.make({ id: "test/login", description: "", match: Trap.exact("/login.php"), methods: ["POST"] })
  const any = Trap.make({ id: "test/any", description: "", match: Trap.suffix(".php") })

  it("respects methods and order", () => {
    expect(Option.map(Trap.find([login, any], "POST", "/login.php"), (t) => t.id)).toEqual(Option.some("test/login"))
    expect(Option.map(Trap.find([login, any], "GET", "/login.php"), (t) => t.id)).toEqual(Option.some("test/any"))
    expect(Trap.find([login, any], "GET", "/index.html")).toEqual(Option.none())
  })
})
