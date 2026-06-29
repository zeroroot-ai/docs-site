import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider';
import './globals.css';

export const metadata = {
  title: 'ZeroRoot Documentation',
  description: 'ZeroRoot platform documentation',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
