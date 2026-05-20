// src/components/ThemeToggle.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let initialTheme: "light" | "dark" = "light";
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (prefersDark) {
      initialTheme = "dark";
    }
    
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={toggleTheme}
  className={`p-3 rounded-full transition-all duration-300 ${
    theme === "dark"
      ? "bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg shadow-slate-900/30 text-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20"
      : "bg-black  text-white hover:shadow-xl hover:shadow-amber-500/40"
  }`}
  aria-label="تغییر تم"
>
  <motion.div
    key={theme}
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.5, opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {theme === "dark" ? (
      <Sun className="w-5 h-5 drop-shadow-sm" />
    ) : (
      <Moon className="w-5 h-5 drop-shadow-sm" />
    )}
  </motion.div>
</motion.button>
  );
};