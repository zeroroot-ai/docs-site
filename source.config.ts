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
import rehypeEnvOriginLinks from './scripts/rehype-env-origin-links.mjs';

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
    // Rewrites anchor hrefs targeting the prod app/www/apex origins into
    // sentinels that the Docker entrypoint resolves per environment
    // (docs-site#19). Code fences and prose are untouched by construction.
    rehypePlugins: [rehypeEnvOriginLinks],
    // github-LIGHT, because fumadocs paints the code block's background from
    // its own --color-fd-* tokens rather than from the shiki theme. Under the
    // dark brand that happened to agree with github-dark; under the light one
    // it left dark-theme syntax colours on a light card, which renders as pale
    // grey text on pale grey — the first thing that broke when the ground
    // flipped, and invisible unless you look at a rendered page.
    //
    // Both keys carry the same theme because there is one brand and nothing to
    // switch between. Terminal panels elsewhere stay dark (ADR-0064); a docs
    // code fence is a listing, not a transcript.
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-light',
      },
    },
  },
});
