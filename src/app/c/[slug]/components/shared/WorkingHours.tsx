import { Clock, CheckCircle, XCircle } from "lucide-react";

const DAYS_OF_WEEK = [
  { id: 0, name: "شنبه", persian: "شنبه" },
  { id: 1, name: "یکشنبه", persian: "یکشنبه" },
  { id: 2, name: "دوشنبه", persian: "دوشنبه" },
  { id: 3, name: "سه‌شنبه", persian: "سه‌شنبه" },
  { id: 4, name: "چهارشنبه", persian: "چهارشنبه" },
  { id: 5, name: "پنجشنبه", persian: "پنجشنبه" },
  { id: 6, name: "جمعه", persian: "جمعه" },
];

interface WorkingHoursProps {
  offDays: number[];
}

export function WorkingHours({ offDays }: WorkingHoursProps) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <Clock size={18} className="text-emerald-400" /> ساعت کاری
      </h3>
      <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl overflow-hidden border border-white/10">
        <div className="divide-y divide-white/10">
          {DAYS_OF_WEEK.map((day) => {
            const isOff = offDays?.includes(day.id);
            const isToday = new Date().getDay() === day.id;
            return (
              <div
                key={day.id}
                className={`flex justify-between p-3 ${isToday ? "bg-emerald-500/10" : ""}`}
              >
                <span
                  className={`text-sm ${
                    isToday ? "text-emerald-400 font-medium" : "text-gray-300"
                  }`}
                >
                  {day.persian}
                </span>
                <span
                  className={`text-sm flex items-center gap-1 ${
                    isOff ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {isOff ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  {isOff ? "تعطیل" : "۰۸:۰۰ - ۲۲:۰۰"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}