/** @type {import("prettier").Config} */
export default {
  semi: false,
  tailwindStylesheet: "./src/styles/global.css",
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
}
