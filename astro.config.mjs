// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwind from "@astrojs/tailwind"
import typegpuPlugin from "unplugin-typegpu/vite"

// https://astro.build/config
export default defineConfig({
  site: "https://alexjwayne.github.io/",
  integrations: [mdx(), tailwind()],
  vite: {
    plugins: [typegpuPlugin({})],
    optimizeDeps: {
      esbuildOptions: { target: "esnext" },
    },
    build: {
      target: "esnext",
    },
  },
})
