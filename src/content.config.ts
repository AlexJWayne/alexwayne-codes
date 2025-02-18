import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const posts = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      cover: image().optional(),
      source: z.string().url().optional(),
    }),
})

export const collections = { posts }
