// components/CustomerList/BulkSmsModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { MessageSquare, Send, X, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface Client {
  id: string;
  name: string;
  phone: string;
  total_bookings: number;
  is_blocked: boolean;
}

interface BulkSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  userSmsBalance: number;
  onSend: (message: string, clientIds: string[]) => void; // تغییر به sync (چون هوک mutate async است)
}

export const BulkSmsModal: React.FC<BulkSmsModalProps> = ({
  isOpen,
  onClose,
  clients,
  userSmsBalance,
  onSend,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const activeClients = useMemo(() => clients.filter((c) => !c.is_blocked), [clients]);

  useEffect(() => {
    if (isOpen && activeClients.length > 0) {
      setSelectedClients(activeClients.map((c) => c.id));
    }
    if (!isOpen) {
      setSelectedClients([]);
      setMessage("");
    }
  }, [isOpen, activeClients]);

  const handleToggleAll = () => {
    if (selectedClients.length === activeClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(activeClients.map((c) => c.id));
    }
  };

  const handleToggleClient = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!message.trim()) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>متن پیام را وارد کنید</span>
        </div>
      ));
    }

    if (selectedClients.length === 0) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>حداقل یک مشتری انتخاب کنید</span>
        </div>
      ));
    }

    if (selectedClients.length > userSmsBalance) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>موجودی کافی نیست</span>
        </div>
      ));
    }

    setIsSending(true);
    try {
      // فراخوانی onSend (که حالا از هوک useSendBulkSms استفاده می‌کند)
      await onSend(message, selectedClients);
      
      toast.custom((t) => (
        <div className="bg-emerald-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <Send className="w-6 h-6" />
          <span>پیام‌ها با موفقیت ارسال شد</span>
        </div>
      ));
      
      resetAndClose();
    } catch (e) {
      console.error(e);
      toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>خطا در ارسال پیام</span>
        </div>
      ));
    } finally {
      setIsSending(false);
    }
  };

  const resetAndClose = () => {
    setSelectedClients([]);
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetAndClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">پیام همگانی به مشتریان</h3>
          </div>
          <button
            onClick={resetAndClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-300">انتخاب شده</span>
              <span className="text-emerald-300 font-bold">{selectedClients.length} نفر</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">هزینه</span>
              <span
                className={
                  selectedClients.length > userSmsBalance
                    ? "text-red-400 font-bold"
                    : "text-emerald-300 font-bold"
                }
              >
                {selectedClients.length} پیامک
              </span>
            </div>
            {selectedClients.length > userSmsBalance && (
              <p className="text-xs text-red-400 mt-2">❌ موجودی کافی نیست</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-3 block">
              متن پیام{" "}
              <span className="text-xs text-gray-500">
                (می‌توانید از {`{client_name}`} استفاده کنید)
              </span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="سلام {client_name} عزیز، تخفیف ویژه این هفته برای شما..."
              className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40"
            />
          </div>

          <div>
            <div className="flex justify-between mb-3">
              <label className="text-sm text-gray-300">مشتریان</label>
              <button
                onClick={handleToggleAll}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {selectedClients.length === activeClients.length
                  ? "عدم انتخاب همه"
                  : "انتخاب همه"}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {activeClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleToggleClient(client.id)}
                      className="w-5 h-5 text-emerald-500 rounded"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{client.total_bookings} نوبت</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={resetAndClose}
            disabled={isSending}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl"
          >
            انصراف
          </button>
          <button
            onClick={handleSend}
            disabled={
              isSending ||
              selectedClients.length === 0 ||
              selectedClients.length > userSmsBalance
            }
            className="flex-1 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> ارسال پیام
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};