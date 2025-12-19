// File Path: src\app\(client pages)\clientdashboard\layout.tsx


"use client"; 

import AuthGuard from "./AuthGuard";

export default function ClientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <AuthGuard>
        <main dir="rtl" className={`antialiased`}>
             {children}
        </main>
    </AuthGuard>

  );
}