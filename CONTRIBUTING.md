# Contributing to effect-honeypot

This repository uses [Vite+](https://viteplus.dev) (`vp`) with pnpm workspaces.

```sh
vp install          # install dependencies (also installs the pre-commit hook)
vp check            # format, lint (oxlint + @enfect/oxlint, type-aware) and type check
vp run check        # the Effect-patched tsc type gate
vp test             # run every package's tests
vp run -r build     # build every package with `vp pack`
vp run ready        # all of the above
vp run test:coverage && vp exec fallow audit --base origin/trunk   # coverage map, then the fallow gate
```

## Adding a target package

1. Copy `packages/wordpress` to `packages/<target>` and update `package.json`.
2. Export each trap and a `traps` array (most specific first) from `src/index.ts`.
3. Add tests for paths that must and must not be trapped. Avoid generic paths
   (`/login`, `/admin`, `/index.php`) that a legitimate app might serve.
4. Add the package to `packages/effect-honeypot` (dependency, re-export and `allTraps`).

## Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets):

1. Run `vp run changeset` and commit the generated file with your change.
2. On `trunk`, the release workflow opens a "Version packages" PR.
3. Merging that PR publishes the bumped packages to npm.
