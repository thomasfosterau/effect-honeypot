import type { UserConfig } from "vite-plus"

/** Shared `vp pack` (tsdown) settings for every publishable package. */
export const pack: NonNullable<UserConfig["pack"]> = {
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "neutral",
  dts: true,
  sourcemap: true,
  unbundle: true,
}
