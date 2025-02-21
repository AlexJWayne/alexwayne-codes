import typography from "@tailwindcss/typography"
import plugin from "tailwindcss/plugin"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Lexend"],
    },
    fontWeight: {
      thin: undefined,
      light: "200",
      normal: "300",
      medium: "400",
      bold: "500",
      extrabold: undefined,
      black: "800",
    },

    extend: {
      dropShadow: {
        "dark-glow": ["0 0px 4px rgba(0,0,0, 0.7)"],
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        html: {
          fontSize: "20px",
        },
      })
    }),
    typography,
  ],
}
