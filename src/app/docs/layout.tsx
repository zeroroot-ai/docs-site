import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    // themeSwitch off: the brand is a single locked dark theme with no light
    // variant, and RootProvider already disables the theme provider. The
    // sidebar rendered a sun/moon toggle anyway — a control that cannot do
    // anything, next to a palette that has nothing to switch to.
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: 'ZeroRoot Docs' }}
      themeSwitch={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
