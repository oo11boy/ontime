import type {  Viewport } from "next";
import localFont from "next/font/local"; // برای حل قطعی مشکل CLS فونت
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google"; 

const yekanBakh = localFont({
  src: [
    {
      path: "../../public/fonts/YekanBakh.woff", // مسیر فونت را چک کنید
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-yekan",
  display: "swap", // برای رندر سریع‌تر متن
});

export const viewport: Viewport = {
  themeColor: "#1D222A",
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
    "@type": "SoftwareApplication",
    name: "آنتایم (OnTime)",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
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
    description:
      "اپلیکیشن نوبت دهی آنلاین برای آرایشگاه‌ها، پزشکان و مراکز خدماتی",
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive" // بهینه‌سازی زمان لود
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${yekanBakh.variable} font-sans antialiased`}
        style={{ backgroundColor: "#1B1F28" }}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <GoogleAnalytics gaId="G-4RXRWQ2J4K" />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1e26",
              color: "#fff",
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
