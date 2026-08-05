import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';

export const metadata = {
  title: 'ZeroRoot Documentation',
  description: 'ZeroRoot platform documentation',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // `dark` is set statically, and the theme provider is switched off.
    //
    // Without it the page rendered half-broken: globals.css paints the body
    // with the brand's dark background token, but every fumadocs component
    // reads its own --color-fd-* tokens, which resolve to their LIGHT values
    // unless a `dark` class is on the root. The result was light cards and
    // light-mode text sitting on a dark page.
    //
    // The brand is dark-only, so this is not a default to be toggled: there
    // is no light variant to switch to, and leaving the provider enabled
    // would let next-themes strip the class on hydration.
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
