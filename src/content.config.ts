import { defineCollection } from "astro:content"
import { glob, file } from "astro/loaders"

const posts = defineCollection({
  loader: glob({ pattern: "src/posts/*.md" }),
})
