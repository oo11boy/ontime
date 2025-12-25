"use client";

import { Wallet, Clock, Share2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import React, { useState, useMemo } from "react";

export default function CalculatorEnhanced(): React.JSX.Element {
  const [fee, setFee] = useState(500000);
  const [missed, setMissed] = useState(10);

  const antonymeCost = 200000;

  const stats = useMemo(() => {
    const totalSavedValue = fee * missed;
    const hoursSavedValue = Math.round((missed * 10) / 60);
    const percentage =
      totalSavedValue > 0
        ? ((antonymeCost / totalSavedValue) * 100).toFixed(1)
        : "0";

    return {
      totalSavedValue,
      totalSavedFarsi: totalSavedValue.toLocaleString("fa-IR"),
      hoursSaved: hoursSavedValue.toLocaleString("fa-IR"),
      costPercentage: percentage,
      antonymeCostFarsi: antonymeCost.toLocaleString("fa-IR"),
    };
  }, [fee, missed]);

  const shareOnWhatsApp = () => {
    const message = `سلام! من با ماشین‌حساب "آنتایم" محاسبه کردم که با سیستم نوبت‌دهی هوشمند، می‌تونیم ماهانه از ضرر ${stats.totalSavedFarsi} تومانی جلوگیری کنیم و ${stats.hoursSaved} ساعت وقت آزاد داشته باشیم. هزینه سیستم هم فقط ${stats.antonymeCostFarsi} تومنه! به نظرم بررسی‌اش کنیم: https://ontimeapp.ir`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="roi" className="py-24 bg-slate-50/50" dir="rtl">
      <Script
        id="roi-calculator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ماشین‌حساب هوشمند بازگشت سرمایه (ROI) آنتایم",
            description:
              "ابزاری برای محاسبه میزان جلوگیری از ضرر مالی و صرفه‌جویی در زمان با استفاده از پنل نوبت‌دهی آنلاین.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "IRR",
            },
          }),
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-[120px] pointer-events-none"></div>

          <div className="text-right mb-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
                چقدر از <span className="text-blue-400">ضرر مالی</span> جلوگیری
                می‌کنید؟
              </h2>
              {/* بهبود کنتراست رنگ متن توضیح */}
              <p className="text-slate-300 font-medium text-lg max-w-xl">
                با آنتایم، نوبت‌های فراموش‌شده را به درآمد تبدیل کنید و
                هزینه‌های اضافی را حذف کنید.
              </p>
            </div>
            <button
              onClick={shareOnWhatsApp}
              aria-label="اشتراک گذاری نتیجه در واتس‌اپ"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl transition-all border border-slate-700 text-sm font-bold w-fit"
            >
              <Share2 size={18} />
              اشتراک‌گذاری با شریک
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 relative z-10">
            <div className="lg:col-span-2 space-y-12">
              <CalculatorSlider
                id="fee-slider"
                label="میانگین مبلغ هر نوبت (تومان)"
                value={fee}
                onChange={setFee}
                min={100000}
                max={5000000}
                step={50000}
                unit="تومان"
              />

              <CalculatorSlider
                id="missed-slider"
                label="تعداد نوبت‌های کنسل شده ماهانه"
                value={missed}
                onChange={setMissed}
                min={1}
                max={100}
                step={1}
                unit="نوبت"
              />

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-start gap-4 backdrop-blur-sm">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                <p className="text-sm text-emerald-50 font-bold leading-relaxed">
                  هزینه اشتراک آنتایم فقط
                  <span className="text-emerald-400 px-1 text-base underline underline-offset-4">
                    {stats.costPercentage}٪
                  </span>
                  از سودی است که به جیب شما برمی‌گردد.
                </p>
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-center shadow-2xl flex flex-col justify-between border border-white/10 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                  <Wallet className="text-white" size={32} />
                </div>
                {/* افزایش کنتراست متن زیر */}
                <p className="text-blue-50 mb-2 font-bold text-sm uppercase tracking-widest">
                  سود بازگشتی ماهانه:
                </p>
                <div className="text-4xl lg:text-5xl font-black mb-1 tracking-tight text-white">
                  {stats.totalSavedFarsi}
                </div>
                <p className="text-blue-100 text-xs font-bold mb-8">
                  تومان در ماه
                </p>

                <div className="bg-blue-900/40 rounded-3xl p-5 border border-white/5">
                  <p className="text-[11px] text-blue-50 mb-1 font-bold">
                    هزینه آنتایم در مقابل این درآمد:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-black text-white">
                      {stats.antonymeCostFarsi}
                    </span>
                    <span className="text-[10px] text-blue-100">تومان</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-8 relative z-10">
                <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-white">
                    <Clock size={16} />
                    <span>صرفه‌جویی در زمان:</span>
                  </div>
                  <span className="font-black text-white">
                    {stats.hoursSaved} ساعت
                  </span>
                </div>

                <Link
                  href="/register"
                  className="w-full block py-5 bg-white text-blue-700 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                >
                  ۲ ماه رایگان شروع کنید
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

function CalculatorSlider({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: SliderProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* استفاده از htmlFor برای اتصال لیبل به اینپوت */}
        <label
          htmlFor={id}
          className="text-lg font-bold text-slate-100 cursor-pointer"
        >
          {label}
        </label>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          <span className="text-xl font-black text-blue-400 tabular-nums">
            {value.toLocaleString("fa-IR")}
          </span>
          <span className="text-xs text-slate-600 mr-2 font-bold">{unit}</span>
        </div>
      </div>
      <input
        id={id} // آی‌دی یکتا
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full h-3 bg-slate-800 rounded-xl appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
      />
    </div>
  );
}
