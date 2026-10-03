import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- SEO Metadata ---
// Update this URL to your production domain (GitHub Pages or custom domain)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tablo.app";
const ogImage = `${siteUrl}/og-image.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tablo — Restoran Yönetim Platformu",
    template: "%s · Tablo",
  },
  description:
    "Restoranınızın menüsünü, masalarını, rezervasyonlarını ve profilini tek bir modern panelden yönetin. Saniyeler içinde kurulum, müşterileriniz için paylaşılabilir public sayfa.",
  keywords: [
    "restoran yönetimi",
    "menü yönetimi",
    "rezervasyon sistemi",
    "masa yönetimi",
    "restoran SaaS",
    "online rezervasyon",
    "restoran yazılımı",
    "menu dijital",
    "Tablo",
  ],
  authors: [{ name: "Tablo" }],
  creator: "Tablo",
  publisher: "Tablo",
  applicationName: "Tablo",
  category: "business",
  alternates: {
    canonical: "/",
  },
  // Open Graph — Facebook, LinkedIn, etc.
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Tablo",
    title: "Tablo — Restoranınızı Tek Panelden Yönetin",
    description:
      "Menünüzü, masalarınızı ve rezervasyonlarınızı tek bir modern platform üzerinden kolayca yönetin. Müşterileriniz için paylaşılabilir public sayfa dahil.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Tablo — Restoran Yönetim Platformu",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Tablo — Restoranınızı Tek Panelden Yönetin",
    description:
      "Menünüzü, masalarınızı ve rezervasyonlarınızı tek bir modern platform üzerinden kolayca yönetin.",
    images: [ogImage],
  },
  // Favicons
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/favicon.svg" }],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1612" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Tablo",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Restoran yönetim platformu — menü, masa, rezervasyon ve public restoran sayfası yönetimi.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "TRY",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "128",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
