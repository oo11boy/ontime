import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Script from "next/script";
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
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://ontimeapp.ir/#website",
        "url": "https://ontimeapp.ir",
        "name": "آنتایم",
        "alternateName": ["OnTime", "اپلیکیشن آنتایم", "سامانه آنتایم"],
        "publisher": { "@id": "https://ontimeapp.ir/#organization" }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://ontimeapp.ir/#software",
        "name": "آنتایم (OnTime)",
        "operatingSystem": "Web, Android, iOS",
        "applicationCategory": "BusinessApplication",
        "url": "https://ontimeapp.ir",
        "description": "اپلیکیشن نوبت دهی آنلاین برای آرایشگاه‌ها، پزشکان و مراکز خدماتی",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IRR",
          "availability": "https://schema.org/InStock",
          "description": "۲ ماه اشتراک رایگان برای شروع"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1240"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://ontimeapp.ir/#organization",
        "name": "آنتایم",
        "url": "https://ontimeapp.ir",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ontimeapp.ir/icons/icon-512.png"
        }
      }
    ]
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="آنتایم" />
        <Script
          id="global-json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${yekanBakh.variable} font-sans antialiased`}
        style={{ backgroundColor: "#1B1F28" }}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        
        {/* کدهای تحلیلی و چت آنلاین */}
        {/* <GoogleAnalytics gaId="G-8PVVM0N5SV" /> */}
        
        {/* اسکریپت گفتینو */}
        <Script id="goftino-widget" strategy="afterInteractive">
          {`
            !function(){var i="YOUR_GOFTINO_TOKEN",a=window,d=document;function t(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.type="text/javascript",g.async=!0,g.src=l?s+"?o="+l:s,d.getElementsByTagName("head")[0].appendChild(g)}
            "complete"===d.readyState?t():a.attachEvent?a.attachEvent("onload",t):a.addEventListener("load",t,!1)}();
          `}
        </Script>

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