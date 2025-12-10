
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
             {/* Antialiased Class را اینجا روی یک Wrapper قرار دهید */}
             {children}
        </main>
    </AuthGuard>

  );
}