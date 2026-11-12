@../AGENTS.md
@../CONTRIBUTING.md
@../README.md

# Claude Code in this repository

The general agent guide is `AGENTS.md` (imported above with `CONTRIBUTING.md` and `README.md`). This file holds only what is specific to Claude Code: the hooks in `.claude/settings.json`.

## Sessions and hooks

- The SessionStart hook (`.claude/hooks/session-start.sh`, also the devcontainer's `postCreateCommand`) installs the global Vite+ CLI at the catalog's `vite-plus` pin with the official installer (npm-provenance and SHA-512 checked; the session's network must allow `vite.plus` and `viteplus.dev`), links `vp` and `vpx` into `~/.local/bin` (the CLI lives under `$VP_HOME` when set, as in the Vite+ container image, else `~/.local/share/vite-plus`), runs `vp install --frozen-lockfile` (which runs the `prepare` step: the git hooks and the `effect-tsgo` patch), and repairs a broken bare `node`. Nothing else goes on PATH: the global `vp` delegates to each checkout's own `vite-plus` (worktrees included, after their own `vp install`), fallow runs as `vp exec fallow …`, and TypeScript scripts as `vpx <file>.ts`. If the installer can't run, `vp` falls back to this checkout's `node_modules` copy. It hydrates no secrets; none are needed, and nothing here can publish.
- A PreToolUse hook (`.claude/hooks/fallow-gate.sh`) blocks `git commit` / `git push` when `fallow audit --base origin/trunk` (run through `vp exec fallow`, the checkout's own pinned copy) returns `fail`, only in this checkout and its `.claude/worktrees/*`: from any other tree it runs none of that tree's tooling and skips the audit with a notice; it reads the coverage map on disk, so run `vp run test:coverage` first. A PostToolUse hook runs `vp fmt --write` on each edited source, JSON or Markdown file.
