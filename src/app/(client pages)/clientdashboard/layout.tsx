import Footer from "./components/Footer/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="fa" style={{ height: '-webkit-fill-available' }}>  {/* این مهمه برای Chrome */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#1B1F28] h-screen">  {/* bg مشکی به body اضافه شد */}
        <div className="max-w-md mx-auto w-full relative flex-1 flex flex-col">
          <main className="grow pb-20">  {/* pb-20 رو نگه دار، اما حالا body هم مشکیه */}
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}