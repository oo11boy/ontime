// src/app/(client pages)/clientdashboard/components/DashboardHeader.tsx
"use client";

import React, { useState, useEffect } from "react";
import Header from "./Header/Header";

interface DashboardHeaderProps {
  userData?: {
    name: string;
    phone: string;
    job_title: string;
  };
}

export function DashboardHeader({ userData }: DashboardHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`
        sticky top-0 z-50 w-full 
        transition-all duration-300 
        border-b
        ${scrolled 
          ? 'bg-white/95 dark:bg-[#1E222B]/95 backdrop-blur-md shadow-lg dark:shadow-xl border-slate-200/80 dark:border-white/10' 
          : 'bg-white dark:bg-[#1E222B] shadow-md dark:shadow-md border-slate-200/60 dark:border-white/5'
        }
      `}
    >
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <Header />
      </div>
    </div>
  );
}