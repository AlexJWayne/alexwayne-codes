// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"
import typegpuPlugin from "unplugin-typegpu/vite"

// https://astro.build/config
export default defineConfig({
  site: "https://alexjwayne.github.io/",
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss(), typegpuPlugin({})],
    optimizeDeps: {
      rolldownOptions: { transform: { target: "esnext" } },
    },
    build: {
      target: "esnext",
    },
  },
})
