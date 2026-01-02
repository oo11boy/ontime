import React from "react";
import { Bell, Plus, X, Clock } from "lucide-react";

interface SmsReminderSectionProps {
  sendReminderSms: boolean;
  setSendReminderSms: (value: boolean) => void;
  reminderTime: number;
  setReminderTime: (time: number) => void;
  reminderMessage: string;
  setReminderMessage: (message: string) => void;
  onOpenTemplateModal: () => void;
  formatPreview: (text: string) => string;
}

const SmsReminderSection: React.FC<SmsReminderSectionProps> = ({
  sendReminderSms,
  setSendReminderSms,
  reminderTime,
  setReminderTime,
  reminderMessage,
  setReminderMessage,
  onOpenTemplateModal,
  formatPreview,
}) => {
  return (
    <div className="bg-white/5 z-[999] rounded-2xl p-5 border border-white/5">
      {/* هدر و دکمه سوییچ */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setSendReminderSms(!sendReminderSms)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${sendReminderSms ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'}`}>
            <Bell className="w-5 h-5" />
          </div>
          <span className={`font-medium transition-colors ${sendReminderSms ? 'text-white' : 'text-gray-400'}`}>ارسال پیامک یادآوری</span>
        </div>
        
        {/* Toggle Switch */}
        <div className={`w-12 h-6 rounded-full transition-all relative ${sendReminderSms ? 'bg-emerald-500' : 'bg-gray-600'}`}>
           <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${sendReminderSms ? 'left-7' : 'left-1'}`} />
        </div>
      </div>

      {sendReminderSms && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* انتخاب زمان یادآوری */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400/70" />
              <span>زمان ارسال قبل از نوبت</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 6, 24].map((hour) => (
                <button
                  key={hour}
                  onClick={(e) => { e.stopPropagation(); setReminderTime(hour); }}
                  className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    reminderTime === hour
                      ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {hour === 24 ? "۱ روز قبل" : `${hour} ساعت قبل`}
                </button>
              ))}
            </div>
          </div>

          {/* بخش پیش‌نمایش یا دکمه انتخاب */}
          <div>
            {!reminderMessage ? (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenTemplateModal(); }}
                className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all group"
              >
                <Plus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-300">انتخاب متن یادآوری</span>
              </button>
            ) : (
              <div className="relative bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                {/* دکمه حذف برای بازگشت به حالت انتخاب */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setReminderMessage(""); }}
                  className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  پیش‌نمایش متن یادآوری
                </div>

                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {formatPreview(reminderMessage)}
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default SmsReminderSection;