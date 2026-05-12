// src/hooks/usePayment.ts
import { useState } from "react";
import toast from "react-hot-toast";
import { detectPlatform } from "@/lib/platform";

export const usePayment = () => {
  const [isPending, setIsPending] = useState(false);

  const startPayment = async (amount: number, type: 'plan' | 'sms', itemId: number | string, desc: string) => {
    setIsPending(true);
    
    // تشخیص پلتفرم (حالا sync شده)
    const platform = detectPlatform();
    
    // اگر در اپ هستیم ولی کافه بازار نصب نیست، پیام بده
    const userAgent = navigator.userAgent.toLowerCase();
    const isWebView = userAgent.includes('wv');
    const hasCafeBazaar = userAgent.includes('cafebazaar') || userAgent.includes('com.farsitel.bazaar');
    
    if (isWebView && !hasCafeBazaar) {
      toast.error(
        "برای خرید درون برنامه‌ای، لطفاً کافه بازار را روی گوشی خود نصب کنید. در غیر این صورت از درگاه زیبال استفاده خواهد شد.",
        { duration: 5000 }
      );
      // ادامه می‌دهیم تا زیبال باز شود
    }
    
    try {
      const res = await fetch("/api/client/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          type, 
          item_id: itemId, 
          description: desc,
          platform 
        }),
      });
      
      const data = await res.json();
      
      // درگاه کافه بازار (فقط اگر کافه بازار نصب باشد می‌آید)
      if (data.gateway === 'cafebazaar') {
        if ((window as any).bazaarPaymentHandler) {
          (window as any).bazaarPaymentHandler.initiatePayment(data.sku, data.trackId);
        } else {
          // fallback به زیبال اگر هندلر وجود نداشت
          toast.error("درگاه کافه بازار در دسترس نیست. به درگاه زیبال هدایت می‌شوید.");
          if (data.trackId || data.gatewayUrl) {
            window.location.href = data.gatewayUrl || `https://gateway.zibal.ir/start/${data.trackId}`;
          }
          setIsPending(false);
        }
      } 
      // درگاه زیبال
      else if (data.trackId) {
        window.location.href = `https://gateway.zibal.ir/start/${data.trackId}`;
      } 
      else {
        toast.error(data.message || "خطا در اتصال به درگاه");
        setIsPending(false);
      }
    } catch {
      toast.error("خطای شبکه");
      setIsPending(false);
    }
  };

  return { startPayment, isPending };
};