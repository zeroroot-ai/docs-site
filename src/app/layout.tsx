import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';

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
      </body>
    </html>
  );
}
