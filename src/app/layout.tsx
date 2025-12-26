import type { Metadata, Viewport } from "next";
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


// متادیتای اختصاصی برای صفحه بلاگ (این را در صفحه /blog/page.tsx استفاده کنید)
export const blogMetadata: Metadata = {
  title: "مجله آنتایم | مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار و نوبت‌دهی",
  description: "آخرین مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار در مجله آنتایم ✅ راهکارهای عملی برای افزایش نوبت‌دهی، مدیریت هوشمند مشتریان و رشد پایدار درآمد کسب‌وکار شما.",
  keywords: [
    "مقالات مدیریت کسب و کار",
    "آموزش نوبت دهی آنلاین",
    "مدیریت مشتریان آرایشگاه",
    "افزایش درآمد کسب و کار",
    "نکات مدیریت زمان",
    "سامانه نوبت دهی",
    "جذب مشتری بیشتر",
    "یادآوری نوبت پیامکی",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/blog",
  },
  openGraph: {
    title: "مجله آنتایم | جدیدترین مقالات مدیریت کسب‌وکار و نوبت‌دهی آنلاین",
    description: "راهکارهای عملی و حرفه‌ای برای افزایش نوبت‌ها، مدیریت هوشمند مشتریان و رشد پایدار درآمد شما. مقالات رایگان و به‌روز مجله آنتایم.",
    url: "https://ontimeapp.ir/blog",
    siteName: "آنتایم",
    images: [
      {
        url: "https://ontimeapp.ir/blog-og-image.jpg", // پیشنهاد: یک تصویر اختصاصی برای بلاگ بسازید (1200x630)
        width: 1200,
        height: 630,
        alt: "مجله تخصصی آنتایم - مقالات مدیریت کسب‌وکار",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مجله آنتایم | آموزش‌ها و مقالات مدیریت نوبت‌دهی",
    description: "نکات کاربردی برای رشد کسب‌وکار: افزایش نوبت، جذب مشتری و مدیریت بهتر زمان.",
    images: ["https://ontimeapp.ir/blog-og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};
export const metadata: Metadata = {
  metadataBase: new URL("https://ontimeapp.ir"),
  title: {
    default: "آنتایم | اپلیکیشن هوشمند نوبت دهی آنلاین و مدیریت مشتریان",
    template: "%s | آنتایم",
  },
  description:
    "هوشمندترین سامانه و اپلیکیشن نوبت دهی برای پزشکان، آرایشگاه‌ها و مراکز آموزشی. همین حالا با ۲ ماه اشتراک رایگان و ۱۵۰ پیامک هدیه ماهانه شروع کنید.",
  keywords: [
    "نوبت دهی آنلاین",
    "مدیریت آرایشگاه",
    "نوبت دهی پزشکان",
    "سامانه یادآوری پیامکی",
    "نرم افزار مدیریت نوبت",
    "رزرو آنلاین",
    "پنل مدیریت مشتریان",
    "اپلیکیشن نوبت دهی آنلاین",
  ],
  authors: [{ name: "OnTime Team" }],
  publisher: "آنتایم",
  alternates: {
    canonical: "https://ontimeapp.ir",
  },
  openGraph: {
    title: "آنتایم - تحولی در مدیریت نوبت‌دهی کسب‌وکار شما",
    description:
      "۲ ماه استفاده رایگان از تمامی امکانات پنل مدیریت و نوبت‌دهی آنتایم",
    url: "https://ontimeapp.ir",
    siteName: "آنتایم",
    images: [
      {
        url: "/icons/icon-192.png",
        width: 1200,
        height: 630,
        alt: "پنل مدیریت نوبت‌دهی آنتایم",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "آنتایم |اپلیکیشن نوبت‌دهی آنلاین",
    description: "۲ ماه رایگان نوبت‌های خود را هوشمند مدیریت کنید.",
    images: ["/icons/icon-192.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png" }, // برای مرورگرهای قدیمی
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }, // آیکون اصلی
    ],
    apple: [
      { url: "/icons/apple-icon.png", sizes: "180x180", type: "image/png" }, // مخصوص آیفون
    ],
  },
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
