import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { getAppConfig } from "@/lib/config";
import { getSite } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// viewportFit: "cover" is what makes env(safe-area-inset-*) resolve to non-zero
// on notched iPhones; globals.css pads the nav, gutters, and footer back out of
// the unsafe areas. Zoom is deliberately left enabled.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const site = getSite();
  return {
    title: site.identity.fullName,
    description: site.seo.defaultDescription,
    icons: {
      icon: "/favicon.svg",
      apple: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { features, urls } = getAppConfig();
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{ fontFamily: "var(--font-inter-tight)" }}>
        <Nav
          showStatus={features.showStatus}
          statusText={features.statusText}
          resumeUrl={urls.resume}
        />
        {children}
        <SiteFooter githubUrl={urls.github} />
      </body>
    </html>
  );
}
