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
    <div className="bg-white dark:bg-[#1a1e26] border border-emerald-300 dark:border-emerald-500/30 rounded-xl p-4 shadow-lg w-[90%] md:w-md">
      <div className="flex items-center gap-2 mb-3">
        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <p className="text-slate-800 dark:text-white font-bold">نوبت با موفقیت ثبت شد!</p>
      </div>
      
      <div className="space-y-2 text-sm text-slate-600 dark:text-gray-300 mb-4">
        <div className="flex justify-between">
          <span>مشتری:</span>
          <span className="text-slate-800 dark:text-white">{name.trim()}</span>
        </div>
        <div className="flex justify-between">
          <span>تاریخ و زمان:</span>
          <span className="text-slate-800 dark:text-white">{jalaliDateStr} - {selectedTime}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={onClose}
          className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm transition-colors"
        >
          مشاهده در تقویم
        </button>
        <button
          onClick={() => {
            onClose();
            router.push("/clientdashboard/calendar");
          }}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
        >
          ثبت نوبت جدید
        </button>
      </div>
    </div>
  );
}