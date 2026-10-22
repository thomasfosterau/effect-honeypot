/**
 * Traps for framework-agnostic probes: secrets and configuration left in the
 * web root, version-control metadata, database dumps, admin tools and
 * well-known exploit paths.
 *
 * @since 0.1.0
 */
import { Trap } from "@thomasfosterau/effect-honeypot-core"
import * as HttpServerResponse from "effect/http/HttpServerResponse"

/**
 * @since 0.1.0
 * @category traps
 */
export const dotenv: Trap.Trap = Trap.make({
  id: "common/dotenv",
  description: ".env files and their variants (.env.local, .env.production, ...)",
  tags: ["secrets"],
  match: Trap.regex(/\/\.env(?:\.[\w-]+)*$/),
  decoy: HttpServerResponse.text(
    "APP_ENV=production\nAPP_DEBUG=false\nDB_HOST=127.0.0.1\nDB_DATABASE=app\nDB_USERNAME=app\nDB_PASSWORD=honeypot\n",
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const versionControl: Trap.Trap = Trap.make({
  id: "common/version-control",
  description: "Git, Subversion, Mercurial and Bazaar metadata",
  tags: ["secrets", "vcs"],
  match: Trap.regex(/(?:^|\/)\.(?:git|svn|hg|bzr)(?:\/|$)|\/\.gitconfig$|\/\.git-credentials$/),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const credentials: Trap.Trap = Trap.make({
  id: "common/credentials",
  description: "Cloud, SSH, Docker and editor credential files",
  tags: ["secrets"],
  match: Trap.anyOf(
    Trap.directory("/.aws", "/.ssh", "/.docker", "/.kube", "/.config/gcloud"),
    Trap.suffix(
      "/.htpasswd",
      "/.npmrc",
      "/.pypirc",
      "/sftp-config.json",
      "/.vscode/sftp.json",
      "/id_rsa",
      "/id_ed25519",
    ),
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const serverConfig: Trap.Trap = Trap.make({
  id: "common/server-config",
  description: "Web server configuration and status pages",
  tags: ["config"],
  match: Trap.anyOf(
    Trap.suffix("/.htaccess", "/web.config", "/.ds_store"),
    Trap.exact("/server-status", "/server-info", "/nginx_status"),
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const backups: Trap.Trap = Trap.make({
  id: "common/backups",
  description: "Database dumps and site archives",
  tags: ["backups"],
  match: Trap.regex(
    /\.sql(?:\.gz|\.zip|\.bz2)?$|\/(?:backup|backups|dump|db|database|site|www|wwwroot|htdocs|public_html)\.(?:zip|tar|tar\.gz|tgz|rar|7z)$/,
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const phpinfo: Trap.Trap = Trap.make({
  id: "common/phpinfo",
  description: "phpinfo() pages",
  tags: ["php"],
  match: Trap.suffix("/phpinfo.php", "/info.php", "/php_info.php", "/i.php"),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const adminTools: Trap.Trap = Trap.make({
  id: "common/admin-tools",
  description: "phpMyAdmin, Adminer and similar database tools",
  tags: ["php", "admin"],
  match: Trap.anyOf(
    Trap.directory("/phpmyadmin", "/pma", "/myadmin", "/mysqladmin", "/dbadmin"),
    Trap.suffix("/adminer.php"),
  ),
})

/**
 * @since 0.1.0
 * @category traps
 */
export const exploits: Trap.Trap = Trap.make({
  id: "common/exploits",
  description: "Paths of widely scanned exploits (PHPUnit eval-stdin, CGI, router admin pages, Spring actuators)",
  tags: ["exploits"],
  match: Trap.anyOf(
    Trap.suffix("/eval-stdin.php"),
    Trap.directory("/vendor/phpunit", "/cgi-bin", "/boaform", "/actuator"),
    Trap.exact("/hnap1"),
  ),
})

/**
 * Any `.php` request. Only include this when nothing behind the honeypot is
 * written in PHP.
 *
 * @since 0.1.0
 * @category traps
 */
export const php: Trap.Trap = Trap.make({
  id: "common/php",
  description: "Any PHP script",
  tags: ["php"],
  match: Trap.regex(/\.php\d?$/),
})

/**
 * Every common trap except {@link php}, most specific first.
 *
 * @since 0.1.0
 * @category traps
 */
export const traps: ReadonlyArray<Trap.Trap> = [
  dotenv,
  versionControl,
  credentials,
  serverConfig,
  backups,
  phpinfo,
  adminTools,
  exploits,
]
