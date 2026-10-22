/**
 * Traps for requests probing for Drupal.
 *
 * Generic paths that Drupal shares with many other apps (`/user/login`,
 * `/node/1`, `/install.php`) are deliberately left out to avoid trapping
 * legitimate traffic.
 *
 * @since 0.1.0
 */
import { Trap } from "@effect-honeypot/core"
import * as HttpServerResponse from "effect/http/HttpServerResponse"

const tags = ["drupal", "php"]

/**
 * @since 0.1.0
 * @category traps
 */
export const changelog: Trap.Trap = Trap.make({
  id: "drupal/changelog",
  description: "CHANGELOG.txt, used to fingerprint the Drupal version",
  tags,
  match: Trap.exact("/changelog.txt", "/core/changelog.txt"),
  decoy: HttpServerResponse.text(
    "Drupal 7.58, 2018-03-28\n------------------------\n- Fixed security issues (multiple vulnerabilities). See SA-CORE-2018-002.\n",
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const settings: Trap.Trap = Trap.make({
  id: "drupal/settings",
  description: "sites/*/settings.php and backups of it",
  tags,
  match: Trap.regex(/^\/sites\/[^/]+\/(?:settings|settings\.local|default\.settings)\.php(?:[.~_-].*)?$/),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const core: Trap.Trap = Trap.make({
  id: "drupal/core",
  description: "Drupal core scripts and assets (install, update, authorize, rebuild, drupal.js)",
  tags,
  match: Trap.anyOf(
    Trap.exact(
      "/core/install.php",
      "/core/authorize.php",
      "/core/rebuild.php",
      "/core/update.php",
      "/core/misc/drupal.js",
      "/misc/drupal.js",
      "/core/core.services.yml",
    ),
    Trap.directory("/core/modules", "/core/themes", "/core/lib/drupal"),
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const files: Trap.Trap = Trap.make({
  id: "drupal/files",
  description: "The public and private files directories",
  tags,
  match: Trap.directory("/sites/default/files", "/sites/default/private"),
})

/**
 * Every Drupal trap, most specific first.
 *
 * @since 0.1.0
 * @category traps
 */
export const traps: ReadonlyArray<Trap.Trap> = [changelog, settings, core, files]
