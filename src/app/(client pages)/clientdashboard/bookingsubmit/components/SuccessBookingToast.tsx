import { Check } from "lucide-react";

// کامپوننت موفقیت ثبت نوبت با لینک مشتری
export function SuccessBookingToast({ 
  onClose, 
  name, 
  jalaliDateStr, 
  selectedTime, 
  router 
}: { 
  onClose: () => void; 
  name: string; 
  jalaliDateStr: string; 
  selectedTime: string;
  customerToken: string;
  router: any;
}) {

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