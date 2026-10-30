import * as EffectTsgo from "@effect/tsgo/oxlint-presets"
import effect from "@enfect/oxlint"
import { defineConfig } from "vite-plus"

/**
 * Input fingerprint for the cached tasks: auto tracking minus node_modules
 * bookkeeping churn (pnpm rewrites `.modules.yaml` on every install), with the
 * lockfile back explicitly so a dependency upgrade still invalidates a run.
 */
const cacheInputs = [{ auto: true }, "!node_modules/**", "!coverage/**", "pnpm-lock.yaml"]

export default defineConfig({
  fmt: {
    semi: false,
    printWidth: 120,
    ignorePatterns: ["**/CHANGELOG.md", ".changeset/*.md", "**/coverage/**"],
  },
  lint: {
    // `effecttsgo/*` rules come from the Effect language service; they need the
    // `effect-tsgo patch` applied by the `prepare` script. `effect/*` rules come
    // from `@enfect/oxlint`'s `recommended` config (every rule at `error`).
    extends: [EffectTsgo.recommended, effect.configs.recommended],
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "promise", "vitest", "jsdoc"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
    },
    ignorePatterns: ["**/dist/**", "**/coverage/**", "**/node_modules/**"],
    // Type-aware through oxlint-tsgolint (bundled with Vite+, patched by
    // `effect-tsgo patch --oxlint`): `typeAware` runs the type-aware rules and
    // `typeCheck` reports TypeScript's (and the Effect language service's)
    // diagnostics, so `vp check` is also the type gate.
    options: {
      typeAware: true,
      typeCheck: true,
    },
    // Vite+'s own plugin, for `vite-plus/prefer-vite-plus-imports`.
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      // Everything under `effect/http` is marked unstable, and this library is built on it.
      "effecttsgo/unstable-api-usage": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
      // `_tag` is the discriminant of every Effect tagged union; reading it is the point.
      "eslint/no-underscore-dangle": "off",
      // Effect's doc-comment tags.
      "jsdoc/check-tag-names": ["error", { definedTags: ["since", "category"] }],
    },
    overrides: [
      {
        // A Node server entrypoint passes `node:http`'s `createServer` to
        // `NodeHttpServer.layer`; it builds a server, it is not an HTTP client
        // (1 site: examples/node-server/src/main.ts).
        files: ["examples/**"],
        rules: {
          "effect/use-http-client-service": "off",
        },
      },
      {
        files: ["**/*.test.ts"],
        rules: {
          "vitest/no-standalone-expect": [
            "error",
            { additionalTestBlockFunctions: ["it.effect", "it.scoped", "it.live", "it.scopedLive", "it.layer"] },
          ],
        },
      },
    ],
  },
  test: {
    include: ["packages/*/test/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.ts"],
      // `coverage/coverage-final.json` is the map `fallow audit` reads for its
      // per-function CRAP scores.
      reporter: ["text-summary", "json"],
    },
  },
  run: {
    cache: true,
    tasks: {
      // The Effect-patched native `tsc` (TypeScript 7 + `@effect/tsgo`): the
      // type gate with the Effect language service's diagnostics.
      check: {
        command: "tsc -p tsconfig.json",
        cache: { input: cacheInputs },
      },
      "test:coverage": {
        command: "vp test run --coverage",
        cache: false,
      },
    },
  },
  staged: {
    // Format with fixes, lint without: with type-aware lint on, `--fix` would
    // silently apply type-aware autofixes (even of `warn` rules) at commit time,
    // so the commit would differ from the tree that was verified.
    "*": ["vp check --fix --no-lint", "vp check --no-fmt --no-error-on-unmatched-pattern"],
  },
})
