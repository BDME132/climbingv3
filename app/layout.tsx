import { ThemeProvider } from "@/components/theme/theme-provider";
import { Layout, Main } from "@/components/ds";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/site/footer";

import type { Metadata } from "next";

import "./globals.css";

import { cn } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rockclimbutah.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RockClimbUtah - Curated Route Guides for Utah Climbing",
    template: "%s | RockClimbUtah",
  },
  description:
    "Find the best climbing routes in Utah. Curated guides for Rock Canyon, American Fork, Little Cottonwood, and more. No information overload - just the routes worth climbing.",
  keywords: [
    "Utah climbing",
    "rock climbing Utah",
    "Utah climbing routes",
    "Rock Canyon climbing",
    "American Fork Canyon climbing",
    "Little Cottonwood climbing",
    "Wasatch climbing",
    "Utah sport climbing",
    "Utah trad climbing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "RockClimbUtah",
    title: "RockClimbUtah - Curated Route Guides for Utah Climbing",
    description:
      "Find the best climbing routes in Utah. Curated guides with the greatest hits at every grade.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RockClimbUtah - Utah Climbing Route Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RockClimbUtah - Curated Route Guides",
    description:
      "Find the best climbing routes in Utah. Curated guides for Rock Canyon, American Fork, Little Cottonwood, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased w-screen flex flex-col",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Main className="flex-1">{children}</Main>
          <Footer />
          <div className="fixed bottom-6 right-6">
            <ThemeToggle />
          </div>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </Layout>
  );
}
