import type { Metadata } from "next";

import localFont from "next/font/local";
import { Inter as FontSans } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/providers";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

interface RootLayoutProps {
  children: React.ReactNode;
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "audio to video converter",
    "create videos from audio",
    "effortless video creation",
    "audio content to video",
    "no video editing required",
    "visuals for audio tracks",
    "video maker for audio",
    "audio to video platform",
    "easy video creation tool",
    "convert audio to video online",
  ],
  authors: [
    {
      name: "",
      url: "https://musngr.netlify.app", //NOTE: Update this URL with your own website URL
    },
  ],
  creator: "Ibrahim Raimi", //NOTE: Update this with your own name
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.png`],
    creator: "",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased !font-default overflow-x-hidden",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <SessionProviderWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
            storageKey="musngr-theme"
        >
          {children}
        </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
