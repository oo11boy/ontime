interface CustomerStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    active: number;
  };
}

export function CustomerStatsCards({ stats }: CustomerStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white/5 rounded-xl p-2 text-center">
        <p className="text-2xl font-bold text-emerald-400">{stats.total}</p>
        <p className="text-[10px] text-gray-500">کل نوبت‌ها</p>
      </div>
      <div className="bg-white/5 rounded-xl p-2 text-center">
        <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        <p className="text-[10px] text-gray-500">در انتظار</p>
      </div>
      <div className="bg-white/5 rounded-xl p-2 text-center">
        <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
        <p className="text-[10px] text-gray-500">تأیید شده</p>
      </div>
    </div>
  );
}