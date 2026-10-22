/**
 * Traps for requests probing for WordPress.
 *
 * Paths are matched anywhere in the URL (`/blog/wp-login.php`,
 * `/wordpress/wp-admin/`, ...) because scanners guess at install
 * directories too.
 *
 * @since 0.1.0
 */
import { Trap } from "@effect-honeypot/core"
import * as HttpServerResponse from "effect/http/HttpServerResponse"

const tags = ["wordpress", "php"]

/**
 * @since 0.1.0
 * @category traps
 */
export const login: Trap.Trap = Trap.make({
  id: "wordpress/login",
  description: "WordPress login form, the usual credential-stuffing target",
  tags,
  match: Trap.suffix("/wp-login.php"),
  decoy: HttpServerResponse.html(`<!DOCTYPE html>
<html lang="en-US"><head><meta charset="UTF-8"><title>Log In &lsaquo; WordPress</title></head>
<body class="login wp-core-ui"><div id="login"><h1><a href="https://wordpress.org/">Powered by WordPress</a></h1>
<form name="loginform" id="loginform" action="wp-login.php" method="post">
<p><label for="user_login">Username or Email Address</label><input type="text" name="log" id="user_login" class="input" size="20" autocapitalize="off" autocomplete="username" required="required"></p>
<div class="user-pass-wrap"><label for="user_pass">Password</label><input type="password" name="pwd" id="user_pass" class="input password-input" size="20" autocomplete="current-password" required="required"></div>
<p class="submit"><input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Log In"><input type="hidden" name="testcookie" value="1"></p>
</form></div></body></html>`),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const xmlrpc: Trap.Trap = Trap.make({
  id: "wordpress/xmlrpc",
  description: "XML-RPC endpoint, used for brute forcing and pingback abuse",
  tags,
  match: Trap.suffix("/xmlrpc.php"),
  decoy: HttpServerResponse.text("XML-RPC server accepts POST requests only."),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const directories: Trap.Trap = Trap.make({
  id: "wordpress/directories",
  description: "wp-admin, wp-includes, wp-content and wp-json trees (plugin and theme vulnerability scans)",
  tags,
  match: Trap.regex(/(?:^|\/)wp-(?:admin|includes|content|json)(?:\/|$)/),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const config: Trap.Trap = Trap.make({
  id: "wordpress/config",
  description: "wp-config.php and editor/backup copies of it",
  tags,
  match: Trap.regex(/\/wp-config\.php(?:[.~_-].*)?$|\/wp-config\.(?:bak|old|txt|orig|save)$/),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const scripts: Trap.Trap = Trap.make({
  id: "wordpress/scripts",
  description: "Other root wp-*.php scripts (wp-cron, wp-signup, wp-load, ...)",
  tags,
  match: Trap.regex(/\/wp-[a-z-]+\.php$/),
})

/**
 * Every WordPress trap, most specific first.
 *
 * @since 0.1.0
 * @category traps
 */
export const traps: ReadonlyArray<Trap.Trap> = [login, xmlrpc, config, directories, scripts]
