// src/lib/freetime.ts
export const freetime = {
  sms: 50,        // عدد خام
  plan: "۲ هفته",   // متن آماده برای نمایش
  planValue: 2,     // مقدار عددی (برای محاسبات)
  planUnit: "week"  // واحد (month/week)
}

// تابع کمکی برای فرمت کردن عدد با جداکننده هزارگان
export const formatSmsCount = (count: number) => {
  return count.toLocaleString('fa-IR');
}