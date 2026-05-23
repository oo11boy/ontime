const STATUSES = [
  { id: "all", label: "همه" },
  { id: "pending", label: "در انتظار" },
  { id: "active", label: "تأیید شده" },
  { id: "rejected", label: "رد شده" },
  { id: "cancelled", label: "لغو شده" },
  { id: "done", label: "انجام شده" },
];

interface FilterTabsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ currentFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {STATUSES.map((status) => (
        <button
          key={status.id}
          onClick={() => onFilterChange(status.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            currentFilter === status.id
              ? "bg-emerald-500 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}