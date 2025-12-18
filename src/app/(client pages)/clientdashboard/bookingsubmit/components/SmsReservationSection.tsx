import React from "react";
import { MessageSquare, Plus } from "lucide-react";

interface SmsReservationSectionProps {
  sendReservationSms: boolean;
  setSendReservationSms: (value: boolean) => void;
  reservationMessage: string;
  setReservationMessage: (message: string) => void;
  onOpenTemplateModal: () => void;
}

const SmsReservationSection: React.FC<SmsReservationSectionProps> = ({
  sendReservationSms,
  setSendReservationSms,
  reservationMessage,
  setReservationMessage,
  onOpenTemplateModal,
}) => {
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20">
      <label className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <span className="font-medium">ارسال پیامک تأیید رزرو به مشتری</span>
        </div>
        <input
          type="checkbox"
          checked={sendReservationSms}
          onChange={(e) => setSendReservationSms(e.target.checked)}
          className="w-6 h-6 text-emerald-500 rounded focus:ring-emerald-500"
        />
      </label>
      {sendReservationSms && (
        <div className="mt-5 space-y-3">
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
            value={reservationMessage}
            onChange={(e) => setReservationMessage(e.target.value)}
            placeholder="اینجا میتونی پیام دلخواهتو بنویسی...
میتونی از متغیرهای زیر استفاده کنی:
{client_name} - نام مشتری
{date} - تاریخ نوبت
{time} - زمان نوبت
{services} - خدمات انتخاب شده"
            className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40 backdrop-blur-sm"
            required={sendReservationSms}
          />
          {sendReservationSms && !reservationMessage.trim() && (
            <p className="text-xs text-red-400 mt-1">⚠️ متن پیام رزرو الزامی است</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SmsReservationSection;