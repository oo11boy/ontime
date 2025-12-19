import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OnTime',
  description: 'مدیریت نوبت‌دهی و مشتریان',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OnTime',
  },
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  )
}
