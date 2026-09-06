// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

import type { ReactNode } from 'react';
import Script from 'next/script';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

export const metadata = {
  title: 'ZeroRoot Documentation',
  description: 'ZeroRoot platform documentation',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Every fumadocs component reads its own --color-fd-* tokens. Those are
    // mapped onto the brand tokens in globals.css at :root, so there is no
    // theme class to apply here — and none to strip on hydration.
    //
    // One locked LIGHT brand (ADR-0064). The RootProvider's theme switching
    // stays disabled: there is still nothing to switch to.
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ enabled: false }}>{children}</RootProvider>
        {/* The Google tag (gtag.js), verbatim from the GA4 property. */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="ga4-config" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}</Script>
      </body>
    </html>
  );
}
