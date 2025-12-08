// PlanStatus.tsx
import React from "react";
import { Sparkles, Star } from "lucide-react";

export default function PlanStatus() {
  return (
    <div className="bg-white rounded-3xl w-full mt-4 p-4 border border-gray-200 shadow-sm">
      <div className="flex  items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <div className="flex items-left flex-col gap-2">
              <span className="text-sm font-medium text-gray-600">پلن انتخابی</span>
              <span className="text-lg font-bold text-gray-900">رایگان</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
             34 روز باقیمانده است.
            </p>
          </div>
        </div>

        <button className="mt-2  bg-linear-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-2   px-3 py-3 rounded-2xl font-semibold max-sm:text-sm text-md shadow-md hover:shadow-lg hover:scale-105 transition-all">
    <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
       ارتقا پلن
        </button>
      </div>
    </div>
  );
}