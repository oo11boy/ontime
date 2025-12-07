import { MessageCircle, Plus } from "lucide-react";
export default function SmsStatus() {
  return (
    <div className="flex items-center w-full justify-between">
      {/* بخش چپ: دایره + متن */}
      <div className="flex items-center gap-5">
        {/* دایره سبز با پیشرفت دقیق (تقریباً ۷۰٪) */}
        <div className="relative w-18 h-18 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* پس‌زمینه دایره */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#E5E7EB"
              strokeWidth="11"
              fill="none"
            />
            {/* دایره سبز پرشونده - دقیقاً مثل عکس: حدود 69-70% پر شده */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#34D399"
              strokeWidth="11"
              fill="none"
              strokeDasharray="339.3" // 2 * π * 54 ≈ 339.3
              strokeDashoffset="98" // ≈ 29-30% مصرف شده → 70-71% باقی مونده
              strokeLinecap="round"
            />
          </svg>

          {/* آیکون پیامک وسط دایره */}
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageCircle
              className="w-8 h-8 text-[#34D399]"
              strokeWidth={2.2}
            />
          </div>
        </div>

        {/* متن‌ها */}
        <div className="font-medium">
          <div className="text-white text-xs leading-tight">
            پیامک باقیمانده:
          </div>
          <div className="text-2xl font-bold text-white mt-1 tracking-tight">
            5,289
          </div>
        </div>
      </div>

      {/* دکمه Add More Messages - دقیقاً مثل عکس */}
      <button className="flex items-center mt-2 mr-2 gap-2 bg-white text-amber-700 hover:text-amber-800 px-2 py-3 rounded-2xl font-semibold text-sm  shadow-md hover:shadow-lg transition-all duration-200 border border-amber-200">
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        افزایش پیامک
      </button>
    </div>
  );
}
