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
    plugins: ["typescript", "unicorn", "oxc", "import", "vitest"],
    jsPlugins: effectRecommended.jsPlugins,
    ignorePatterns: ["**/dist/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      ...effectRecommended.rules,
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
