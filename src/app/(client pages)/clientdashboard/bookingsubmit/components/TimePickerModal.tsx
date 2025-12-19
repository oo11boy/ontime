import React from "react";
import { X, Clock, Sun, Sunset, Moon } from "lucide-react";

interface TimePickerModalProps {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  isTimePickerOpen: boolean;
  setIsTimePickerOpen: (open: boolean) => void;
}

const TIME_GROUPS = [
  { label: "صبح", icon: <Sun className="w-4 h-4 text-orange-400" />, slots: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] },
  { label: "عصر", icon: <Sunset className="w-4 h-4 text-emerald-400" />, slots: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
  { label: "شب", icon: <Moon className="w-4 h-4 text-blue-400" />, slots: ["20:00", "20:30", "21:00", "21:30", "22:00"] },
];

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  selectedTime,
  setSelectedTime,
  isTimePickerOpen,
  setIsTimePickerOpen,
}) => {
  if (!isTimePickerOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* بک‌دراپ با افکت بلور */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsTimePickerOpen(false)}
      />

      {/* کانتینر اصلی مودال (بصورت Sheet در موبایل) */}
      <div className="relative w-full max-w-md bg-[#1c212c] border-t border-white/10 sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* هدر مودال */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">انتخاب زمان حضور</h3>
          </div>
          <button 
            onClick={() => setIsTimePickerOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* بدنه اسکرول‌شونده برای لیست ساعت‌ها */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {TIME_GROUPS.map((group) => (
              <div key={group.label} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  {group.icon}
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {group.slots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setTimeout(() => setIsTimePickerOpen(false), 200); // بستن هوشمند پس از انتخاب
                        }}
                        className={`
                          py-3 rounded-2xl text-sm font-medium transition-all active:scale-90
                          ${isSelected 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-white/5 text-gray-300 border border-white/5 hover:border-emerald-500/30"
                          }
                        `}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* فوتر برای تایید نهایی در صورت نیاز */}
        <div className="p-4 bg-white/5 border-t border-white/5">
          <button
            onClick={() => setIsTimePickerOpen(false)}
            className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold transition-all"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;