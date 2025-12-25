import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Script from "next/script";

// ۱. تنظیمات Viewport (اصلاح شده برای کسب امتیاز ۱۰۰ در Accessibility)
export const viewport: Viewport = {
  themeColor: "#1D222A",
  width: "device-width",
  initialScale: 1,
  // حذف maximumScale و userScalable برای اجازه زوم به کاربران و رفع ارور Lighthouse
};

// ۲. متادیتاهای حرفه‌ای برای سئو
export const metadata: Metadata = {
  title: {
    default: "آنتایم | سامانه هوشمند نوبت‌دهی آنلاین و مدیریت مشتریان",
    template: "%s | آنتایم"
  },
  description: "هوشمندترین سامانه نوبت‌دهی برای پزشکان، آرایشگاه‌ها و مراکز آموزشی. همین حالا با ۲ ماه اشتراک رایگان و ۱۵۰ پیامک هدیه ماهانه شروع کنید.",
  keywords: ["نوبت دهی آنلاین", "مدیریت آرایشگاه", "نوبت دهی پزشکان", "سامانه یادآوری پیامکی", "نرم افزار مدیریت نوبت", "رزرو آنلاین", "پنل مدیریت مشتریان"],
  authors: [{ name: "OnTime Team" }],
  publisher: "آنتایم",
  alternates: {
    canonical: "https://ontimeapp.ir",
  },
  openGraph: {
    title: 'آنتایم - تحولی در مدیریت نوبت‌دهی کسب‌وکار شما',
    description: '۲ ماه استفاده رایگان از تمامی امکانات پنل مدیریت و نوبت‌دهی آنتایم',
    url: 'https://ontimeapp.ir',
    siteName: 'آنتایم',
    images: [
      {
        url: '/icons/icon-192.png',
        width: 1200,
        height: 630,
        alt: 'پنل مدیریت نوبت‌دهی آنتایم',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'آنتایم | نوبت‌دهی آنلاین',
    description: '۲ ماه رایگان نوبت‌های خود را هوشمند مدیریت کنید.',
    images: ['/icons/icon-192.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // ۳. اسکیما (Schema.org) اصلاح شده برای موتورهای جستجو
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "آنتایم (OnTime)",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "BusinessApplication",
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
    },
    "description": "سیستم مدیریت نوبت و مشتریان برای آرایشگاه‌ها، پزشکان و مراکز خدماتی"
  };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased" 
        style={{ backgroundColor: "#1B1F28" }}
      >
        <Providers>
          {children}
        </Providers>

        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1e26',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}