"use client";

import { Calendar, Home, Settings, User } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import "./Footer.css";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function Footer() {
  const pathname = usePathname();
  const [ripples, setRipples] = useState<Map<string, Ripple[]>>(new Map());

  const navItems = [
    { href: "/clientdashboard", icon: Home, label: "خانه" },
    { href: "/clientdashboard/clients", icon: User, label: "مشتریان" },
    { href: "/clientdashboard/clients", icon: Calendar, label: "تقویم" },
    { href: "/clientdashboard/clients", icon: Settings, label: "تنظیمات" },
  ];

  const triggerRipple = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = { id: Date.now() + Math.random(), x, y };

    setRipples((prev) => {
      const updated = new Map(prev);
      updated.set(href, [...(updated.get(href) || []), newRipple]);
      return updated;
    });

    setTimeout(() => {
      setRipples((prev) => {
        const updated = new Map(prev);
        const current = updated.get(href) || [];
        updated.set(
          href,
          current.filter((r) => r.id !== newRipple.id)
        );
        if (updated.get(href)?.length === 0) updated.delete(href);
        return updated;
      });
    }, 600);
  };

  const isActive = (href: string) => {
    if (href === "/clientdashboard") {
      return (
        pathname === "/clientdashboard" || pathname === "/clientdashboard/"
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <>
 <footer  className="fixed max-w-md z-999 mx-auto  bottom-0 inset-x-0 h-[10%] bg-[#1B1F28] border-t border-t-blue-400/20 shadow-2xl">
      <nav className="h-full flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const itemRipples = ripples.get(item.href) || [];

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => triggerRipple(e, item.href)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 overflow-hidden"
            >
              {itemRipples.map((ripple) => (
                <span
                  key={ripple.id}
                  className="absolute pointer-events-none rounded-full bg-white/30 animate-ripple-pro"
                  style={{
                    left: ripple.x - 36,
                    top: ripple.y - 36,
                    width: 72,
                    height: 72,
                  }}
                />
              ))}

              <Icon
                size={26}
                strokeWidth={active ? 0 : 2}
                fill={active ? "#75ABEB" : "none"}
                color={active ? "#75ABEB" : "#9EABBE"}
                className="relative z-10 transition-all duration-300"
              />
              <span
                className={`text-xs transition-all duration-300 ${
                  active ? "text-[#75ABEB] font-medium" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </footer>
    
    </>
  );
}
