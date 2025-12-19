"use client";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  X,
  RefreshCw,
  Send,
} from "lucide-react";
import { formatPersianDate } from "@/lib/date-utils";
import { formatTimeDisplay } from "../utils/formatUtils";
import { Appointment } from "@/types";

interface BulkSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  appointments: Appointment[];
  userSmsBalance: number;
  onSend: (message: string, appointmentIds: number[]) => Promise<void>;
}

const BulkSmsModal: React.FC<BulkSmsModalProps> = ({
  isOpen,
  onClose,
  date,
  appointments,
  userSmsBalance,
  onSend,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);

  const activeAppointments = useMemo(() => 
    appointments.filter(app => app.status === 'active'),
    [appointments]
  );

  useEffect(() => {
    if (isOpen && activeAppointments.length > 0) {
      const allActiveIds = activeAppointments.map(app => app.id);
      setSelectedAppointments(allActiveIds);
    }
    
    if (!isOpen) {
      setSelectedAppointments([]);
      setMessage("");
    }
  }, [isOpen, activeAppointments]);

  const handleToggleAll = () => {
    if (selectedAppointments.length === activeAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(activeAppointments.map(app => app.id));
    }
  };

  const handleToggleAppointment = (id: number) => {
    setSelectedAppointments(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("لطفا متن پیام را وارد کنید");
      return;
    }

    if (selectedAppointments.length === 0) {
      toast.error("لطفا حداقل یک مشتری را انتخاب کنید");
      return;
    }

    if (selectedAppointments.length > userSmsBalance) {
      toast.error(`موجودی پیامک کافی نیست. نیاز: ${selectedAppointments.length}، موجودی: ${userSmsBalance}`);
      return;
    }

    setIsSending(true);
    try {
      await onSend(message, selectedAppointments);
      onClose();
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-white">ارسال پیام همگانی</h3>
              <p className="text-sm text-gray-400 mt-1">{formatPersianDate(date.toISOString().split('T')[0])}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">تعداد مشتریان انتخاب شده</span>
              <span className="text-emerald-300 font-bold">{selectedAppointments.length} نفر</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">هزینه پیامک</span>
              <span className={`font-bold ${selectedAppointments.length > userSmsBalance ? 'text-red-400' : 'text-emerald-300'}`}>
                {selectedAppointments.length} پیامک
              </span>
            </div>
            {selectedAppointments.length > userSmsBalance && (
              <p className="text-xs text-red-400 mt-2">
                ❌ موجودی پیامک کافی نیست
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-3 block items-center justify-between">
              <span>متن پیام</span>
              <span className="text-xs text-gray-500">می‌توانید از متغیر {`{client_name}`} استفاده کنید</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="متن پیام همگانی را وارد کنید...
مثال: سلام {client_name} عزیز، یادآوری می‌کنیم که فردا ساعت نوبت شماست."
              className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40 backdrop-blur-sm"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-300">انتخاب مشتریان</label>
              <button
                onClick={handleToggleAll}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {selectedAppointments.length === activeAppointments.length ? 'عدم انتخاب همه' : 'انتخاب همه'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {activeAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(appointment.id)}
                      onChange={() => handleToggleAppointment(appointment.id)}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{appointment.client_name}</p>
                      <p className="text-xs text-gray-400">{formatTimeDisplay(appointment.booking_time)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{appointment.services?.split(',')[0] || 'بدون خدمات'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
            disabled={isSending}
          >
            انصراف
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || selectedAppointments.length === 0 || selectedAppointments.length > userSmsBalance}
            className="flex-1 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ارسال پیام
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkSmsModal;