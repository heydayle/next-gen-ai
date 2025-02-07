import '@/styles/globals.css';

import { PropsWithChildren } from 'react';
import { LanguageProvider } from '@inlang/paraglide-next';
import type { Metadata } from 'next';

import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/lib/constant';
import { fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { languageTag } from '@/paraglide/runtime.js';

export const generateMetadata = (): Metadata => ({
  metadataBase: new URL(siteConfig.url()),
  title: {
    default: siteConfig.title(),
    template: `%s | ${siteConfig.title()}`,
  },
  description: siteConfig.description(),
  keywords: siteConfig.keywords(),
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  verification: {
    google: siteConfig.googleSiteVerificationId(),
  },
  openGraph: {
    url: siteConfig.url(),
    title: siteConfig.title(),
    description: siteConfig.description(),
    siteName: siteConfig.title(),
    images: '/opengraph-image.png',
    type: 'website',
    locale: languageTag(),
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title(),
    description: siteConfig.description(),
    images: '/opengraph-image.png',
  },
});

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <LanguageProvider>
      <html lang={languageTag()} suppressHydrationWarning>
        <body
          className={'overflow-x-hidden' + cn('min-h-screen font-sans', fonts)}
        >
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <div className="flex-1 overflow-x-hidden">
              <ThemeProvider attribute="class">
                <Navbar>
                  <SidebarTrigger className="m-4" />
                </Navbar>
                {children}
                <ThemeSwitcher className="absolute bottom-5 right-5 z-10" />
                <Footer />
                <Toaster />
              </ThemeProvider>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </LanguageProvider>
  );
};

export default RootLayout;
