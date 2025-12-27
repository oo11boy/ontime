import { useBookingLink } from "@/hooks/useBookings";
import { Check, Copy, LinkIcon, Share2 } from "lucide-react";
import toast from "react-hot-toast";

// کامپوننت موفقیت ثبت نوبت با لینک مشتری
export function SuccessBookingToast({ 
  onClose, 
  name, 
  jalaliDateStr, 
  selectedTime, 
  customerToken, 
  router 
}: { 
  onClose: () => void; 
  name: string; 
  jalaliDateStr: string; 
  selectedTime: string;
  customerToken: string;
  router: any;
}) {
  const { copyBookingLink, shareBookingLink, getBookingLink } = useBookingLink();
  const bookingLink = getBookingLink(customerToken);

const handleCopyLink = async () => {
  const result = await copyBookingLink(customerToken);
  if (result.success) {
    toast.success("لینک کپی شد!");
  } else {
    toast.error("خطا در کپی لینک");
  }
};

const handleShareLink = async () => {
  const result = await shareBookingLink(customerToken, name);
  if (!result.success) {
    handleCopyLink();
  }
};

  return (
    <div className="bg-[#1a1e26] border border-emerald-500/30 rounded-xl p-4 shadow-lg w-[90%] md:w-md">
      <div className="flex items-center gap-2 mb-3">
        <Check className="w-5 h-5 text-emerald-400" />
        <p className="text-white font-bold">نوبت با موفقیت ثبت شد!</p>
      </div>
      
      <div className="space-y-2 text-sm text-gray-300 mb-4">
        <div className="flex justify-between">
          <span>مشتری:</span>
          <span className="text-white">{name.trim()}</span>
        </div>
        <div className="flex justify-between">
          <span>تاریخ و زمان:</span>
          <span className="text-white">{jalaliDateStr} - {selectedTime}</span>
        </div>
        
        {/* بخش لینک مشتری */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-emerald-400" />
            <p className="text-emerald-300 font-medium">لینک مدیریت نوبت مشتری:</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <p className="text-xs text-gray-400 break-all truncate" title={bookingLink}>
              {bookingLink}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              کپی لینک
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              اشتراک‌گذاری
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={onClose}
          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm transition-colors"
        >
          مشاهده در تقویم
        </button>
        <button
          onClick={() => {
            onClose();
            router.push("/clientdashboard/calendar");
          }}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          ثبت نوبت جدید
        </button>
      </div>
    </div>
  );
}