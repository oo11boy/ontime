// src/app/components/BaleChannel.tsx
"use client";

import { Send, ExternalLink } from "lucide-react";

export function NotificationChannel() {
  const channelUrl = "https://ble.ir/ontimeapp";

  const handleJoin = () => {
    window.open(channelUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleJoin}
      className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div className="text-right">
          <p className="text-white text-sm font-bold">کانال اطلاع‌رسانی آنتایم</p>
          <p className="text-blue-100 text-xs">پیامرسان بله | ble.ir/ontimeapp</p>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
    </button>
  );
}