import React from "react";
import { MessageSquare, Plus, X } from "lucide-react";

interface SmsReservationSectionProps {
  sendReservationSms: boolean;
  setSendReservationSms: (value: boolean) => void;
  reservationMessage: string;
  setReservationMessage: (message: string) => void;
  onOpenTemplateModal: () => void;
  formatPreview: (text: string) => string;
}

const SmsReservationSection: React.FC<SmsReservationSectionProps> = ({
  sendReservationSms,
  setSendReservationSms,
  reservationMessage,
  setReservationMessage,
  onOpenTemplateModal,
  formatPreview,
}) => {
  return (
    <div className="bg-white/5 z-[999] rounded-2xl p-5 border border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setSendReservationSms(!sendReservationSms)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${sendReservationSms ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className={`font-medium transition-colors ${sendReservationSms ? 'text-white' : 'text-gray-400'}`}>ارسال پیامک تایید</span>
        </div>
        
        {/* Toggle Switch */}
        <div className={`w-12 h-6 rounded-full transition-all relative ${sendReservationSms ? 'bg-emerald-500' : 'bg-gray-600'}`}>
           <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${sendReservationSms ? 'left-7' : 'left-1'}`} />
        </div>
      </div>

      {sendReservationSms && (
        <div className="mt-5 z-[999] animate-in fade-in slide-in-from-top-2 duration-300">
          {!reservationMessage ? (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenTemplateModal(); }}
              className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all group"
            >
              <Plus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">انتخاب متن پیامک رزرو</span>
            </button>
          ) : (
            <div className="relative bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
              <button 
                onClick={() => setReservationMessage("")}
                className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                پیش‌نمایش زنده
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {formatPreview(reservationMessage)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmsReservationSection;