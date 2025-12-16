
export const metadata = {
  title: 'اپلیکیشن آنتایم - پنل مشتری',
  description: 'مدیریت نوبت و خدمات شما',
  manifest: '/manifest.json', // ← این خط رو اضافه کن
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        {/* آیکون‌ها */}
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        {/* فقط برای client pages ثبت service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered!', reg))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}