/**
 * Batteries-included entry point: the core engine plus every bundled set of
 * traps.
 *
 * @since 0.1.0
 */
import * as Common from "@effect-honeypot/common"
import type { Trap } from "@effect-honeypot/core"
import * as Drupal from "@effect-honeypot/drupal"
import * as MediaWiki from "@effect-honeypot/mediawiki"
import * as WordPress from "@effect-honeypot/wordpress"

export * from "@effect-honeypot/core"

export {
  /** @since 0.1.0 */
  Common,
  /** @since 0.1.0 */
  Drupal,
  /** @since 0.1.0 */
  MediaWiki,
  /** @since 0.1.0 */
  WordPress,
}

/**
 * Every bundled trap. Framework-specific traps come first so their decoys win
 * over the generic ones.
 *
 * @since 0.1.0
 * @category traps
 */
export const allTraps: ReadonlyArray<Trap.Trap> = [
  ...WordPress.traps,
  ...Drupal.traps,
  ...MediaWiki.traps,
  ...Common.traps,
]
