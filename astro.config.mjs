// @ts-check
import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import typegpuPlugin from "unplugin-typegpu/vite"

// https://astro.build/config
export default defineConfig({
  site: "https://alexjwayne.github.io/",
  integrations: [tailwind()],
  vite: {
    plugins: [typegpuPlugin({})],
  },
})
