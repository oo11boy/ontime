"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, ListCheck, Plus, LayoutGrid } from "lucide-react";

interface FooterProps {
  userType?: "user" | "staff" | null;
}

export default function Footer({ userType = "user" }: FooterProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/clientdashboard", icon: LayoutGrid, label: "پیشخوان" },
    { href: "/clientdashboard/customers", icon: User, label: "مشتریان" },
    {
      href: "/clientdashboard/bookingsubmit",
      icon: Plus,
      label: "رزرو نوبت",
      isCenter: true,
    },
    { href: "/clientdashboard/calendar", icon: Calendar, label: "تقویم" },
    { href: "/clientdashboard/services", icon: ListCheck, label: "خدمات" },
  ];

  const staffsnavItems = [
    { href: "/clientdashboard", icon: LayoutGrid, label: "پیشخوان" },
    { href: "/clientdashboard/customers", icon: User, label: "مشتریان" },
    {
      href: "/clientdashboard/bookingsubmit",
      icon: Plus,
      label: "رزرو نوبت",
      isCenter: true,
    },
    { href: "/clientdashboard/calendar", icon: Calendar, label: "تقویم" },
    { href: "/clientdashboard/services", icon: ListCheck, label: "خدمات" },
  ];

  const isActive = (href: string) => {
    return href === "/clientdashboard"
      ? pathname === "/clientdashboard"
      : pathname.startsWith(href);
  };

  const items = userType === "staff" ? staffsnavItems : navItems;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] flex justify-center items-end pb-4 px-4 pointer-events-none">
      <motion.nav
        initial={false}
        className="flex items-center justify-around w-full max-w-[460px] h-[80px] bg-white/90 backdrop-blur-xl dark:bg-[#0c111d]/90 dark:backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[28px] px-2 pointer-events-auto relative shadow-lg dark:shadow-2xl transition-all duration-300"
      >
        {items.map((item, index) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={index}
                href={item.href}
                className="relative -top-6 flex flex-col items-center group"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-[22px] flex items-center justify-center border-[5px] border-white dark:border-[#0C111D] shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Plus size={32} className="text-white dark:text-[#0C111D] stroke-[3px]" />
                </motion.div>
                <span
                  className={`text-[11px] mt-2 font-bold transition-all duration-200 ${
                    active 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-500 dark:text-gray-500 group-hover:text-slate-700 dark:group-hover:text-gray-300"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-none group"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-1 inset-y-3 bg-gradient-to-br from-slate-100 to-slate-50 dark:bg-white/[0.03] rounded-2xl -z-0 transition-colors"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}

              <div
                className={`relative z-10 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-gray-500 group-hover:text-slate-700 dark:group-hover:text-gray-300"
                }`}
              >
                <Icon
                  size={active ? 24 : 22}
                  strokeWidth={active ? 2.5 : 2}
                  className="transition-all duration-200"
                />

                <span
                  className={`text-[11px] font-bold tracking-tight transition-all duration-200 ${
                    active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {active && (
                <motion.div
                  layoutId="active-line"
                  className="absolute top-0 w-8 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 rounded-b-full shadow-[0_2px_10px_rgba(16,185,129,0.3)] dark:shadow-[0_2px_10px_rgba(16,185,129,0.5)]"
                />
              )}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}