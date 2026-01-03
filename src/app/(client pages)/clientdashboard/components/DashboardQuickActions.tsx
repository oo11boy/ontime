"use client";

import React, { useState } from "react";
import { PhoneCall, UserPlus, Info, Headset, GraduationCap } from "lucide-react";
import Link from "next/link";

const DashboardQuickActions = () => {
  const [showModal, setShowModal] = useState(false);

  const openGoftino = () => {
    if (typeof window !== "undefined" && (window as any).Goftino) {
      (window as any).Goftino.open();
    } else {
      alert("سیستم پشتیبانی در حال بارگذاری است.");
    }
  };

  const actions = [
    {
      id: 1,
      label: "پشتیبانی",
      icon: <Headset className="w-5 h-5 sm:w-6 sm:h-6" />,
      onClick: openGoftino,
      color: "emerald",
      badge: true,
    },
    {
      id: 2,
      label: "آموزش",
      icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
      onClick: () => setShowModal(true),
      color: "emerald",
    },
    {
      id: 3,
      label: "ارتباط با ما",
      icon: <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6" />,
      href: "./clientdashboard/support",
      color: "blue",
    },
    {
      id: 4,
      label: "افزودن پرسنل",
      icon: <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />,
      onClick: () => setShowModal(true),
      color: "emerald",
    },
  ];

  return (
    <div className="w-full px-2 py-4">
      {/* Grid Container - مدرن و منظم */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
        {actions.map((action) => {
          const content = (
            <div className={`
              relative flex flex-col items-center justify-center aspect-square
              rounded-2xl sm:rounded-3xl border transition-all duration-200
              active:scale-95 touch-none select-none
              ${action.color === 'emerald' 
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10' 
                : 'bg-blue-500/5 border-blue-500/10 text-blue-500 hover:bg-blue-500/10'}
            `}>
              {action.badge && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <div className="mb-1.5">{action.icon}</div>
              <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">
                {action.label}
              </span>
            </div>
          );

          return action.href ? (
            <Link key={action.id} href={action.href} className="no-underline block">
              {content}
            </Link>
          ) : (
            <button key={action.id} onClick={action.onClick} className="w-full">
              {content}
            </button>
          );
        })}
      </div>

      {/* Modal - بازطراحی شده با متدولوژی مدرن */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />
          
          <div className={`
            relative bg-[#1c222c]/95 border-t sm:border border-white/10
            w-full max-w-sm rounded-t-[2rem] sm:rounded-[2.5rem] p-8
            shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300
            text-center
          `}>
            {/* Handle bar for mobile feel */}
            <div className="w-12 h-1.5 bg-gray-600/30 rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex justify-center mb-5">
              <div className="bg-amber-500/15 p-4 rounded-3xl text-amber-500 shadow-inner">
                <Info size={36} />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">به زودی!</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">
              این قابلیت در حال حاضر در دست ساخت است. 
              در آپدیت‌های بعدی همراه ما باشید.
            </p>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardQuickActions;