import React, { ReactNode } from "react";

interface StatItemProps {
  label: string;
  value: number;
  suffix: string;
  icon: ReactNode;
  description?: string;
}

export function StatItem({ 
  label, 
  value, 
  suffix, 
  icon, 
  description 
}: StatItemProps): React.JSX.Element {
  return (
    <div className="group p-8 rounded-4xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-500">
          {icon}
        </div>
      </div>

      <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 font-mono" dir="ltr">
        <strong>{value.toLocaleString()}</strong>
        <span className="text-blue-600">{suffix}</span>
      </div>

      {/* استفاده از H3 برای کلمات کلیدی سطح ۳ */}
      <h3 className="text-slate-800 font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
        {label}
      </h3>

      {description && (
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}