// components/BeautySalon/BeautyReviews.tsx
export default function BeautyReviews() {
  const reviews = [
    { name: "سارا رضایی", role: "لاین ناخن", text: "از وقتی از آنتایم استفاده می‌کنم، دیگه لازم نیست وسط کار جواب تلفن بدم. مشتریام هم خیلی راضی‌ترن." },
    { name: "مریم حسینی", role: "سالن زیبایی مریم", text: "پیامک یادآوری باعث شده کنسلی‌های من تقریباً به صفر برسه. واقعاً عالیه." }
  ];

  return (
    <section className="py-24 bg-pink-50/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-5xl font-black mb-16">آرایشگران درباره ما چه می‌گویند؟</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-pink-100 text-right">
              <p className="text-slate-600 italic mb-6 leading-relaxed">"{r.text}"</p>
              <div className="font-black text-slate-900">{r.name}</div>
              <div className="text-pink-600 text-sm">{r.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}