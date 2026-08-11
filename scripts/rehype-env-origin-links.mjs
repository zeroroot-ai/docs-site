/**
 * rehype-env-origin-links — make functional cross-surface links
 * environment-derived (docs-site#19, epic env-derived-links).
 *
 * Authors keep writing natural production URLs in MDX
 * (`https://app.zeroroot.ai/...`, `https://zeroroot.ai/pricing`). At build
 * time this plugin rewrites ANCHOR HREFS — and only anchor hrefs — that
 * target the production app / www / apex origins into the
 * `__APP_ORIGIN__` / `__WWW_ORIGIN__` sentinels. The Docker entrypoint
 * (docker/40-substitute-origins.sh) substitutes the serving environment's
 * real origins at container start, so one static image links to
 * `app.staging.zeroroot.ai` on staging and `app.zeroroot.ai` on prod.
 *
 * Everything that is not a link node is untouched by construction: code
 * fences, inline code, and prose keep showing `api.zeroroot.ai` and friends
 * verbatim — those are documentation content, not links.
 *
 * The apex origin maps to WWW: prod's apex is a 301 to www anyway, and
 * staging has no apex host at all.
 */
import { visit } from 'unist-util-visit';

/** Order matters: the www host must match before the bare apex prefix. */
const ORIGIN_SENTINELS = [
  ['https://app.zeroroot.ai', '__APP_ORIGIN__'],
  ['https://www.zeroroot.ai', '__WWW_ORIGIN__'],
  ['https://zeroroot.ai', '__WWW_ORIGIN__'],
];

function rewrite(href) {
  for (const [origin, sentinel] of ORIGIN_SENTINELS) {
    if (href === origin) return sentinel;
    if (
      href.startsWith(`${origin}/`) ||
      href.startsWith(`${origin}?`) ||
      href.startsWith(`${origin}#`)
    ) {
      return sentinel + href.slice(origin.length);
    }
  }
  return null;
}

export default function rehypeEnvOriginLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;
      const rewritten = rewrite(href);
      if (rewritten !== null) node.properties.href = rewritten;
    });
  };
}
