"use client";
import React, { useState } from "react";
import { User, Phone, Contact, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExistingClient } from "../types";
import { useCustomers } from "@/hooks/useCustomers";

interface ClientInfoSectionProps {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  isCheckingClient: boolean;
  existingClient: ExistingClient | null;
  onNameBlur?: () => void;
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  name,
  setName,
  phone,
  setPhone,
  isCheckingClient,
  existingClient,
  onNameBlur,
}) => {
  const [isClientListOpen, setIsClientListOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const { data: customersData, isLoading } = useCustomers(1, clientSearch);
  const clients = customersData?.clients || [];

  const handleSelectClient = (client: any) => {
    setName(client.name);
    setPhone(client.phone);
    setIsClientListOpen(false);
    setClientSearch("");
  };

  return (
    <>
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={onNameBlur}
              placeholder="نام و نام خانوادگی"
              className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl pr-12 px-4 py-3.5 text-right placeholder:text-slate-400 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm text-slate-800 dark:text-white"
            />
            <User className="absolute right-4 top-4 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                if (digits.length <= 11) {
                  let displayValue = digits;
                  if (digits.startsWith("09") && digits.length === 11) {
                    displayValue = digits.slice(1);
                  } else if (digits.length === 11 && !digits.startsWith("09")) {
                    return;
                  }
                  setPhone(displayValue);
                }
              }}
              placeholder="9123456789"
              dir="ltr"
              className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-right px-4 py-3.5 pr-12 placeholder:text-slate-400 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm font-mono text-slate-800 dark:text-white"
            />
            <Phone className="absolute right-4 top-4 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {isCheckingClient && (
              <div className="absolute left-4 top-4">
                <div className="w-5 h-5 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsClientListOpen(true)}
          className="w-[120px] h-[120px] bg-slate-100 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-emerald-300 dark:border-emerald-500/30 flex flex-col items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-white/15 transition-all hover:border-emerald-500 dark:hover:border-emerald-400"
        >
          <Contact className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-center leading-tight text-slate-700 dark:text-white">
            انتخاب از <br /> مشتریان
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isClientListOpen && (
          <div className="fixed inset-0 z-[999] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClientListOpen(false)}
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              key="client-list-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-[#1a1e26] w-full max-w-md relative rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col border-t border-slate-200 dark:border-white/10"
            >
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsClientListOpen(false);
                    setClientSearch("");
                  }}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition"
                >
                  <X className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                </motion.button>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">انتخاب مشتری</h3>
                <div className="w-10" />
              </div>

              <div className="px-4 py-4">
                <div className="relative">
                  <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 dark:text-gray-400" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="جستجو بر اساس نام یا شماره..."
                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl pr-12 px-4 py-3.5 text-right placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 border border-slate-200 dark:border-white/10 transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 dark:text-gray-500">در حال دریافت لیست...</p>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-gray-500">مشتری یافت نشد</div>
                ) : (
                  clients.map((client: any, index: number) => (
                    <motion.button
                      key={client.id || `client-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectClient(client)}
                      className="w-full p-4 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all text-right border border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-emerald-600 dark:text-emerald-500 opacity-0 group-hover:opacity-100 transition">انتخاب</div>
                        <div className="font-bold text-slate-700 dark:text-gray-200">{client.name}</div>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-gray-500 mt-1 font-mono" dir="ltr">
                        {client.phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")}
                      </div>
                      <div className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-white/5 rounded-md text-[10px] text-slate-500 dark:text-gray-500 mt-3">
                        {client.total_bookings || 0} نوبت ثبت شده
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientInfoSection;