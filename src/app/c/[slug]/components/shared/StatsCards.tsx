import { Users, Award, Sparkles } from "lucide-react";
import { BusinessData } from "./types";

interface StatsCardsProps {
  business: BusinessData;
}

export function StatsCards({ business }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-3 text-center border border-white/10">
        <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
        <p className="text-lg font-bold text-white">{business.total_visits || 0}</p>
        <p className="text-[10px] text-gray-400">بازدید کل</p>
      </div>
      <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-3 text-center border border-white/10">
        <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
        <p className="text-lg font-bold text-white">۱۰۰٪</p>
        <p className="text-[10px] text-gray-400">رضایت</p>
      </div>
      <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-3 text-center border border-white/10">
        <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
        <p className="text-lg font-bold text-white">{business.services?.length || 0}</p>
        <p className="text-[10px] text-gray-400">خدمات</p>
      </div>
    </div>
  );
}