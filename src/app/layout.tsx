import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
// import { GoogleAnalytics } from "@next/third-parties/google";

const yekanBakh = localFont({
  src: [
    {
      path: "../../public/fonts/YekanBakh.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-yekan",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1D222A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://ontimeapp.ir/#website",
        url: "https://ontimeapp.ir",
        name: "آنتایم",
        alternateName: ["OnTime", "اپلیکیشن آنتایم", "سامانه آنتایم"],
        publisher: { "@id": "https://ontimeapp.ir/#organization" },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://ontimeapp.ir/#software",
        name: "آنتایم (OnTime)",
        operatingSystem: "Web, Android, iOS",
        applicationCategory: "BusinessApplication",
        url: "https://ontimeapp.ir",
        description:
          "اپلیکیشن نوبت دهی آنلاین برای آرایشگاه‌ها، پزشکان و مراکز خدماتی",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IRR",
          availability: "https://schema.org/InStock",
          description: "۲ ماه اشتراک رایگان برای شروع",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "1240",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://ontimeapp.ir/#organization",
        name: "آنتایم",
        url: "https://ontimeapp.ir",
        logo: {
          "@type": "ImageObject",
          url: "https://ontimeapp.ir/icons/icon-512.png",
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="آنتایم" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover"
        />
        <Script
          id="global-json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${yekanBakh.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>



        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--toast-bg, #1a1e26)",
              color: "var(--toast-color, #fff)",
              border: "1px solid #333",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              style: {
                background: "#ef4444",
                color: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}