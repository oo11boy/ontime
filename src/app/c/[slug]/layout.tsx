
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="bg-[#1C2737]">
      {children}
    </section>
  )
}
