"use client";
import React, { useState } from "react";
import { Search, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer/Footer";

const customers = [
  { id: "1", name: "رضا احمدی", phone: "0935 450 2369", lastVisit: "۱۴۰۳/۰۹/۱۷" },
  { id: "2", name: "علی محمدی", phone: "0912 345 6789", lastVisit: "۱۴۰۳/۰۹/۱۵" },
  { id: "3", name: "سارا رضایی", phone: "0936 789 0123", lastVisit: "۱۴۰۳/۰۹/۱۰" },
  { id: "4", name: "محمد حسینی", phone: "0911 234 5678", lastVisit: "۱۴۰۳/۰۹/۰۵" },
  { id: "5", name: "فاطمه کاظمی", phone: "0937 890 1234", lastVisit: "۱۴۰۳/۰۹/۰۱" },
  { id: "6", name: "حسین نوری", phone: "0921 567 8901", lastVisit: "۱۴۰۳/۰۸/۲۹" },
  { id: "7", name: "مریم شریفی", phone: "0938 901 2345", lastVisit: "۱۴۰۳/۰۸/۲۵" },
  { id: "8", name: "امیرحسین رضوی", phone: "0918 123 4567", lastVisit: "۱۴۰۳/۰۸/۲۰" },
];

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchQuery) ||
      c.phone.includes(searchQuery)
  );

  return (
           <div className="h-screen text-white overflow-auto max-w-md m-auto">
  
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white">
      {/* هدر جستجو - ثابت */}
      <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو نام یا شماره..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 px-5 pr-12 bg-[#242933] rounded-xl border border-emerald-500/40 focus:border-emerald-400 focus:outline-none text-sm placeholder-gray-400 transition"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* لیست مشتریان */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3 pb-32">
        {filteredCustomers.length === 0 ? (
          <p className="text-center text-gray-400 py-20 text-lg">
            مشتری پیدا نشد
          </p>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-gray-50/5 backdrop-blur-sm rounded-xl border border-emerald-500/20 p-4 hover:border-emerald-400/60 hover:bg-gray-50/10 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                {/* آواتار و اطلاعات */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {customer.name[0]}
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-white group-hover:text-emerald-300 transition">
                      {customer.name}
                    </h3>
                    <p className="text-xs text-gray-400">{customer.phone}</p>
                  </div>
                </div>

                {/* آخرین مراجعه + دکمه */}
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">آخرین مراجعه</p>
                    <p className="text-sm font-bold text-emerald-400">
                      {customer.lastVisit}
                    </p>
                  </div>

                  <Link href={`../clientdashboard/profile`}>
                    <button className="bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 hover:from-emerald-600 hover:to-emerald-700 transition shadow-md">
                  
                      <User className="w-4 h-4 group-hover:-translate-x-1 transition" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


    </div>
          <Footer />
          </div>
  );
}