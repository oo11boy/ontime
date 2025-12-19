// src/app/(client pages)/clientdashboard/components/DashboardHeader.tsx
import React from "react";
import Header from "./Header/Header";
interface DashboardHeaderProps {
  userData: {
    name: string;
    phone: string;
    job_title: string;
  };
}

export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-50 w-full bg-[#1E222B] shadow-lg">
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <Header />
      </div>
    </div>
  );
};