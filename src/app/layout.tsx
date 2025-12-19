// File Path: src\app\layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";


// ۱. جدا کردن تنظیمات Viewport
export const viewport = {
  themeColor: "#1D222A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// ۲. تنظیمات سایر متادیتاها
export const metadata:Metadata = {
  title: "OnTime | پنل مشتریان",
  description: "مدیریت هوشمند نوبت‌دهی",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OnTime",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">

      <body
        className={`antialiased `}
        style={{backgroundColor:"#1B1F28"}}
      >
          <Providers>{children}</Providers>
     
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




