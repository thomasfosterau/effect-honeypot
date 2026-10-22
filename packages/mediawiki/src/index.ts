/**
 * Traps for requests probing for MediaWiki.
 *
 * Only the conventional `/w/` script path is trapped: a bare `/index.php` or
 * `/api.php` is too generic to attribute to MediaWiki.
 *
 * @since 0.1.0
 */
import { Trap } from "@thomasfosterau/effect-honeypot-core"

const tags = ["mediawiki", "php"]

/**
 * @since 0.1.0
 * @category traps
 */
export const localSettings: Trap.Trap = Trap.make({
  id: "mediawiki/local-settings",
  description: "LocalSettings.php and backups of it",
  tags,
  match: Trap.regex(/\/localsettings\.php(?:[.~_-].*)?$/),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const installer: Trap.Trap = Trap.make({
  id: "mediawiki/installer",
  description: "The web installer, mw-config",
  tags,
  match: Trap.regex(/(?:^|\/)mw-config(?:\/|$)/),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const scripts: Trap.Trap = Trap.make({
  id: "mediawiki/scripts",
  description: "Entry points under the conventional /w/ script path",
  tags,
  match: Trap.exact("/w/index.php", "/w/api.php", "/w/load.php", "/w/rest.php", "/w/opensearch_desc.php"),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const specialPages: Trap.Trap = Trap.make({
  id: "mediawiki/special-pages",
  description: "Special:Version and friends, used for fingerprinting",
  tags,
  match: Trap.regex(/^\/wiki\/special:(?:version|userlogin|createaccount)$/),
})

/**
 * Every MediaWiki trap, most specific first.
 *
 * @since 0.1.0
 * @category traps
 */
export const traps: ReadonlyArray<Trap.Trap> = [localSettings, installer, scripts, specialPages]
