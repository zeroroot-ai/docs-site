import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,

  // A catch-all route exports as a SIBLING file — `out/docs.html` — while the
  // `out/docs/` directory that also appears holds only RSC payload chunks and
  // has no index.html of its own. Every static host resolves `/docs/` against
  // that index-less directory and 404s (S3 and CloudFront included); nginx
  // 403s on it before it ever tries `docs.html`.
  //
  // The site compensated for that in nginx.conf, with a regex location that
  // stripped the trailing slash and retried `$base.html`. That made the
  // container the only place the export worked — the same bytes on object
  // storage were broken. `trailingSlash: true` emits `out/docs/index.html`
  // instead, which every host serves correctly with no rules at all, so the
  // compensating nginx blocks are deleted rather than duplicated per host.
  //
  // scripts/check-static-export-standalone.mjs asserts this holds.
  trailingSlash: true,
};

export default withMDX(config);
