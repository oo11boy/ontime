
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="bg-black">
      {children}
    </section>
  )
}
