import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const stories = defineCollection({
	// Load Markdown and MDX files in the `src/content/stories/` directory.
	loader: glob({ base: './src/content/stories', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		imgSrc: z.string().optional(),
		subTitle: z.string().optional(),
	}),
});

const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		subTitle: z.string(),
		imgSrc: z.coerce.string(),
	})
})

export const collections = { stories, pages };
