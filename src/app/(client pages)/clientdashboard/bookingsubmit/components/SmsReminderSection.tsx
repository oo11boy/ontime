import React from "react";
import { Bell, Plus } from "lucide-react";

interface SmsReminderSectionProps {
  sendReminderSms: boolean;
  setSendReminderSms: (value: boolean) => void;
  reminderTime: number;
  setReminderTime: (time: number) => void;
  reminderMessage: string;
  setReminderMessage: (message: string) => void;
  onOpenTemplateModal: () => void;
}

const SmsReminderSection: React.FC<SmsReminderSectionProps> = ({
  sendReminderSms,
  setSendReminderSms,
  reminderTime,
  setReminderTime,
  reminderMessage,
  setReminderMessage,
  onOpenTemplateModal,
}) => {
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20">
      <label className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-emerald-400" />
          <span className="font-medium">ارسال پیامک یادآوری</span>
        </div>
        <input
          type="checkbox"
          checked={sendReminderSms}
          onChange={(e) => setSendReminderSms(e.target.checked)}
          className="w-6 h-6 text-emerald-500 rounded focus:ring-emerald-500"
        />
      </label>
      {sendReminderSms && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-3 block">زمان ارسال یادآوری</label>
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 6, 24].map((hour) => (
                <button
                  key={hour}
                  onClick={() => setReminderTime(hour)}
                  className={`px-5 py-3.5 rounded-xl font-medium text-sm transition-all ${
                    reminderTime === hour
                      ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20"
                  }`}
                >
                  {hour} ساعت قبل
                </button>
              ))}
            </div>
          </div>
          <div>
            <button
              onClick={onOpenTemplateModal}
              className="w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl p-3 flex items-center gap-4 shadow-2xl hover:shadow-emerald-500/40 active:scale-[0.98] transition-all border border-emerald-500/30"
            >
              <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div className="text-right flex-1">
                <h4 className="font-bold text-sm text-white">پیامک های آماده</h4>
                <p className="text-emerald-100 text-sm opacity-90">از لیست پیام های آماده انتخاب کن.</p>
              </div>
            </button>
            <textarea
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              placeholder="اینجا میتونی پیام دلخواهتو بنویسی...
میتونی از متغیرهای زیر استفاده کنی:
{client_name} - نام مشتری
{time} - زمان نوبت"
              className="mt-3 w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40 backdrop-blur-sm"
              required={sendReminderSms}
            />
            {sendReminderSms && !reminderMessage.trim() && (
              <p className="text-xs text-red-400 mt-1">⚠️ متن پیام یادآوری الزامی است</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsReminderSection;