import * as EffectTsgo from "@effect/tsgo/oxlint-presets"
import effect from "@mpsuesser/oxlint-plugin-effect"
import { defineConfig } from "vite-plus"

const effectRecommended = effect.configs.recommended

export default defineConfig({
  fmt: {
    semi: false,
    printWidth: 120,
    ignorePatterns: ["**/CHANGELOG.md", ".changeset/*.md"],
  },
  lint: {
    // `effecttsgo` rules come from the Effect language service; they need the
    // `effect-tsgo patch` applied by the `prepare` script.
    plugins: ["typescript", "unicorn", "oxc", "import", "vitest", ...(EffectTsgo.recommended.plugins ?? [])],
    jsPlugins: effectRecommended.jsPlugins,
    ignorePatterns: ["**/dist/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      ...EffectTsgo.recommended.rules,
      ...effectRecommended.rules,
      // Everything under `effect/http` is marked unstable, and this library is built on it.
      "effecttsgo/unstable-api-usage": "off",
    },
    overrides: [
      {
        // Server entrypoints legitimately touch Node's HTTP module.
        files: ["examples/**"],
        rules: {
          "effect/use-http-client-service": "off",
          "effect/avoid-node-imports": "off",
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
  },
  run: {
    cache: true,
  },
  staged: {
    "*": "vp check --fix",
  },
})
