import Footer from "./components/Footer/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="fa">
      <body className="min-h-screen flex flex-col">

        <div className="max-w-md  bg-white h-screen text-black mx-auto w-full relative flex-1 flex flex-col">
          <main className="grow pb-20" >
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}