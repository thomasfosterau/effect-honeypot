/**
 * Traps describe request paths that legitimate clients of *this* application
 * never ask for, but which vulnerability scanners probe for constantly
 * (`/wp-login.php`, `/.env`, `/.git/config`, ...).
 *
 * @since 0.1.0
 */
import * as Arr from "effect/Array"
import * as HashSet from "effect/HashSet"
import * as Option from "effect/Option"
import type * as P from "effect/Predicate"
import * as Str from "effect/String"
import type * as HttpMethod from "effect/http/HttpMethod"
import type * as HttpServerResponse from "effect/http/HttpServerResponse"

/**
 * A predicate over a normalised request path (see {@link normalizePath}).
 *
 * @since 0.1.0
 * @category models
 */
export type Matcher = P.Predicate<string>

/**
 * @since 0.1.0
 * @category models
 */
export interface Trap {
  /** Stable identifier, conventionally `<target>/<name>`, e.g. `wordpress/login`. */
  readonly id: string
  readonly description: string
  /** Free-form tags used to select or report on traps, e.g. `["wordpress", "php"]`. */
  readonly tags: ReadonlyArray<string>
  /** Restrict the trap to these methods. `Option.none()` matches every method. */
  readonly methods: Option.Option<ReadonlyArray<HttpMethod.HttpMethod>>
  readonly matches: Matcher
  /**
   * A plausible-looking response for this endpoint, used by
   * `Responder.decoy` to keep scanners interested.
   */
  readonly decoy: Option.Option<HttpServerResponse.HttpServerResponse>
}

/**
 * @since 0.1.0
 * @category constructors
 */
export const make = (options: {
  readonly id: string
  readonly description: string
  readonly match: Matcher
  readonly tags?: ReadonlyArray<string>
  readonly methods?: ReadonlyArray<HttpMethod.HttpMethod>
  readonly decoy?: HttpServerResponse.HttpServerResponse
}): Trap => ({
  id: options.id,
  description: options.description,
  tags: options.tags ?? [],
  methods: Option.fromUndefinedOr(options.methods),
  matches: options.match,
  decoy: Option.fromUndefinedOr(options.decoy),
})

/**
 * Matches any of the given paths exactly (after normalisation).
 *
 * @since 0.1.0
 * @category matchers
 */
export const exact = (...paths: ReadonlyArray<string>): Matcher => {
  const set = HashSet.fromIterable(Arr.map(paths, normalizePath))
  return (path) => HashSet.has(set, path)
}

/**
 * Matches a path equal to, or nested below, any of the given directories.
 *
 * @since 0.1.0
 * @category matchers
 */
export const directory = (...directories: ReadonlyArray<string>): Matcher => {
  const normalised = Arr.map(directories, normalizePath)
  return (path) => Arr.some(normalised, (dir) => path === dir || Str.startsWith(`${dir}/`)(path))
}

/**
 * Matches paths whose final segment ends with any of the given suffixes,
 * e.g. `suffix(".php")` or `suffix("/.env")`.
 *
 * @since 0.1.0
 * @category matchers
 */
export const suffix = (...suffixes: ReadonlyArray<string>): Matcher => {
  const lowered = Arr.map(suffixes, Str.toLowerCase)
  return (path) => Arr.some(lowered, (s) => Str.endsWith(s)(path))
}

/**
 * @since 0.1.0
 * @category matchers
 */
export const regex =
  (pattern: RegExp): Matcher =>
  (path) =>
    pattern.test(path)

/**
 * @since 0.1.0
 * @category combinators
 */
export const anyOf =
  (...matchers: ReadonlyArray<Matcher>): Matcher =>
  (path) =>
    Arr.some(matchers, (m) => m(path))

/**
 * Tests whether a trap matches a request method and (raw) URL.
 *
 * @since 0.1.0
 * @category predicates
 */
export const test = (trap: Trap, method: HttpMethod.HttpMethod, url: string): boolean =>
  Option.match(trap.methods, {
    onNone: () => true,
    onSome: Arr.contains(method),
  }) && trap.matches(normalizePath(url))

/**
 * Finds the first trap matching a request.
 *
 * @since 0.1.0
 * @category predicates
 */
export const find = (traps: Iterable<Trap>, method: HttpMethod.HttpMethod, url: string): Option.Option<Trap> =>
  Arr.findFirst(traps, (trap) => test(trap, method, url))

/**
 * Normalises a request URL so that trivially obfuscated probes
 * (`//WP-LOGIN.php`, `/%2eenv`, `/wp-admin/?x`) match the same traps:
 *
 * - drops the query string and fragment
 * - percent-decodes (leaving malformed sequences as-is)
 * - lower-cases
 * - converts `\` to `/`, collapses repeated slashes and drops trailing slashes
 *
 * @since 0.1.0
 * @category utils
 */
export const normalizePath = (url: string): string => {
  const path = Str.split(/[?#]/)(url)[0] ?? ""
  const decoded = Option.getOrElse(safeDecode(path), () => path)
  const collapsed = decoded
    .toLowerCase()
    .replaceAll("\\", "/")
    .replaceAll(/\/{2,}/g, "/")
  const trimmed = collapsed.replace(/\/+$/, "")
  return Str.startsWith("/")(trimmed) ? trimmed : `/${trimmed}`
}

const safeDecode = Option.liftThrowable(decodeURIComponent)
