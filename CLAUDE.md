# effect-honeypot

Effect v4 HTTP honeypot: traps for probe paths (WordPress, Drupal, MediaWiki, common dotfiles...) plus middleware/layers to block, tarpit or fool the clients that hit them.

## Layout

- `packages/core` – `Trap`, `Responder`, `Blocklist`, `Honeypot`. No trap definitions.
- `packages/<target>` – one package per probed technology; depends only on core and exports individual traps plus a `traps` array (most specific first).
- `packages/effect-honeypot` – umbrella package re-exporting core and every target, with `allTraps`.
- `examples/*` – private runnable examples.

## Conventions

- Effect v4 (`effect@4`): HTTP modules live under `effect/http/*`. Use namespace imports from effect submodules (`import * as Option from "effect/Option"`).
- Lint is oxlint with `@enfect/oxlint`'s `recommended` config (every `effect/*` rule at `error`), `@effect/tsgo`'s preset, oxlint's `correctness`, `suspicious` and `perf` categories over the `eslint`, `typescript`, `unicorn`, `oxc`, `import`, `promise`, `vitest` and `jsdoc` plugins, and `vite-plus/prefer-vite-plus-imports`, configured in the root `vite.config.ts`. Lint is type-aware through oxlint-tsgolint (`typeAware` + `typeCheck`), so `vp check` also reports type errors. Fix findings in code, never with disable comments; scope any exceptions with `lint.overrides` and a reason.
- The Effect language service is `@effect/tsgo`: the `prepare` script runs `effect-tsgo patch`, which patches TypeScript (for `tsc` and editors) and oxlint/tsgolint (so `vp check` reports `effecttsgo/*` rules). `typescript` and `@effect/tsgo` are pinned exactly in the catalog because the patch only supports specific versions; bump them together.
- Workspace packages export `./src/index.ts` directly; `publishConfig.exports` points at `dist/` for npm. Shared `vp pack` settings live in `vite.shared.ts`.
- Every user-facing change to a published package needs a changeset (`vp run changeset`).
- Never edit a version in a `package.json`: versions live in the `pnpm-workspace.yaml` catalog (read its comments; `vite-plus`, `vite`, `vitest`, `@effect/tsgo`, `typescript` and `@enfect/oxlint` move together). After editing it, run `pnpm install` and commit `pnpm-lock.yaml`. `minimumReleaseAge` holds new versions for 8 hours (480 minutes); Dependabot's `cooldown` is 1 day, its smallest unit. Dependabot (`.github/dependabot.yml`) groups every lockstep set (`toolchain`, `effect`, `changesets`, `fallow`, `github-actions`); the moves it cannot make (the `vite` npm alias, the `vitest` pin vite-plus dictates, picking a supporting `@effect/tsgo`) are listed in that file's header.

## Commands and gates

The default branch is `main`. Before pushing, run in this order (CI runs 1–5, `.github/workflows/ci.yml`):

1. `vp check` — format + lint (type-aware through oxlint-tsgolint).
2. `vp run check` — the Effect-patched native `tsc` over `tsconfig.json`.
3. `vp test run` — the unit suite.
4. `vp run -r build` — `vp pack` → every package's `dist/`.
5. `pnpm audit --audit-level high` (network).
6. `vp run test:coverage`, then `fallow audit --format json --quiet --explain --gate-marker agent --base origin/main` (not a CI step). Its config is `.fallowrc.json` (entries, package zones, health thresholds); the audit reads `coverage/coverage-final.json`.

CI holds a read-only token and no secrets (so Dependabot PRs run it safely), pins every action to a commit SHA and never persists checkout credentials; only the Release job holds `id-token: write`, and it never runs for Dependabot. `uvx zizmor --offline .github` audits the workflows (config in `.github/zizmor.yml`).

## Agent sessions

- `.claude/settings.json` enables the `@enfect/claude` plugin (Effect guidance, skills and post-write pattern checks), pinned by `ref` to a reviewed `mpsuesser/enfect` commit.
- A PreToolUse hook (`.claude/hooks/fallow-gate.sh`) blocks `git commit` / `git push` when `fallow audit --base origin/main` returns `fail`; it reads the coverage map on disk, so run `vp run test:coverage` first. A PostToolUse hook runs `vp fmt --write` on each edited source, JSON or Markdown file.

## Fallow task map

| When the agent is about to...                                     | Run                                          |
| ----------------------------------------------------------------- | -------------------------------------------- |
| delete an "unused" export or file                                 | `fallow dead-code --trace <file>:<export>`   |
| delete an "unused" dependency                                     | `fallow dead-code --trace-dependency <name>` |
| commit or open a PR                                               | `fallow audit --base origin/main`            |
| check which architecture rules apply to a file before changing it | `fallow guard <files>`                       |
| understand a finding                                              | `fallow explain <issue-type>`                |

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
