# effect-honeypot

Effect v4 HTTP honeypot: traps for probe paths (WordPress, Drupal, MediaWiki, common dotfiles...) plus middleware/layers to block, tarpit or fool the clients that hit them.

## Layout

- `packages/core` – `Trap`, `Responder`, `Blocklist`, `Honeypot`. No trap definitions.
- `packages/<target>` – one package per probed technology; depends only on core and exports individual traps plus a `traps` array (most specific first).
- `packages/effect-honeypot` – umbrella package re-exporting core and every target, with `allTraps`.
- `examples/*` – private runnable examples.

## Conventions

- Effect v4 (`effect@4`): HTTP modules live under `effect/http/*`. Use namespace imports from effect submodules (`import * as Option from "effect/Option"`).
- Lint is oxlint + `@mpsuesser/oxlint-plugin-effect` (recommended preset) configured in the root `vite.config.ts`; prefer fixing code over disabling rules, and scope any exceptions with `lint.overrides`.
- Workspace packages export `./src/index.ts` directly; `publishConfig.exports` points at `dist/` for npm. Shared `vp pack` settings live in `vite.shared.ts`.
- Every user-facing change to a published package needs a changeset (`vp run changeset`).

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

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
