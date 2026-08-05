/**
 * Fumadocs MDX source configuration.
 *
 * Ported from the dashboard alongside the content it describes. The pages use
 * GitHub-flavoured tables heavily, so remark-gfm is not optional here: without
 * it every table renders as literal pipe characters.
 *
 * Frontmatter is validated at build time — a page missing `title` or
 * `description` fails the build with a clear error rather than shipping an
 * untitled page.
 */
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

/**
 * Page frontmatter schema.
 *
 *   - `title`, required human-readable page title (sidebar, `<title>`, H1)
 *   - `description`, required short summary (SEO description, TOC preview)
 *   - `order`, optional sibling sort order in the sidebar (lower = earlier)
 */
const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().optional(),
});

export const docs = defineDocs({
  dir: 'src/content/docs',
  docs: {
    schema: pageSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypeCodeOptions: {
      themes: {
        light: 'github-dark',
        dark: 'github-dark',
      },
    },
  },
});
