import React from "react";
import { MessageSquare } from "lucide-react";

interface SmsBalanceSectionProps {
  userSmsBalance: number;
  isLoadingBalance: boolean;
  sendReservationSms: boolean;
  sendReminderSms: boolean;
  calculateSmsNeeded: number;
  onBuySms: () => void;
}

const SmsBalanceSection: React.FC<SmsBalanceSectionProps> = ({
  userSmsBalance,
  isLoadingBalance,
  sendReservationSms,
  sendReminderSms,
  calculateSmsNeeded,
  onBuySms,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-gray-300">موجودی و هزینه پیامک</span>
        </div>
        {isLoadingBalance ? (
          <div className="w-6 h-6 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin"></div>
        ) : (
          <span className="font-bold text-lg text-emerald-300">{userSmsBalance} پیامک</span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">پیامک رزرو:</span>
          <div className="flex items-center gap-2">
            <span className={sendReservationSms ? "text-emerald-400 font-bold" : "text-gray-500"}>
              {sendReservationSms ? "۱ پیامک" : "عدم ارسال"}
            </span>
            {sendReservationSms && (
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">پیامک یادآوری:</span>
          <div className="flex items-center gap-2">
            <span className={sendReminderSms ? "text-emerald-400 font-bold" : "text-gray-500"}>
              {sendReminderSms ? "۱ پیامک" : "عدم ارسال"}
            </span>
            {sendReminderSms && (
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        
        <div className="h-px bg-white/10 my-2"></div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">مجموع پیامک‌های این نوبت:</span>
          <div className={`px-3 py-1.5 rounded-lg font-bold ${calculateSmsNeeded > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-500/20 text-gray-400"}`}>
            {calculateSmsNeeded} پیامک
          </div>
        </div>
        
        {calculateSmsNeeded > 0 && calculateSmsNeeded > userSmsBalance && !isLoadingBalance && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-300 text-center">
              ❌ موجودی پیامک کافی نیست!
              <br />
              <button 
                onClick={onBuySms}
                className="underline mt-1 hover:text-red-200 transition"
              >
                برای ادامه خرید پیامک
              </button>
            </p>
          </div>
        )}
        
        {calculateSmsNeeded === 0 && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
              ⚡ هیچ پیامکی برای این نوبت ارسال نمی‌شود
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmsBalanceSection;