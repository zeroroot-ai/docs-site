// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

/**
 * Google Analytics 4 for docs.zeroroot.ai.
 *
 * The Measurement ID is public by design: every visitor's browser receives it.
 * It is read at build time from NEXT_PUBLIC_GA_MEASUREMENT_ID, so only the
 * build that publishes docs.zeroroot.ai (publish-site.yml) carries the tag.
 * The container image ships in every self-hosted and air-gapped install and
 * is built with the variable unset, so that page loads no third-party script
 * and calls nothing outside the perimeter. Owner supplied the ID on
 * 2026-08-25; it lives in the publish workflow, not here.
 *
 * Empty means "no analytics". There is no default ID.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';
