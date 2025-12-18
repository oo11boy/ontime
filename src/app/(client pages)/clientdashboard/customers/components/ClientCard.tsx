// components/CustomerList/ClientCard.tsx
import { User } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    phone: string;
    lastVisit: string;
    total_bookings: number;
    is_blocked: boolean;
    last_booking_date?: string;
  };
  formatPhone: (phone: string) => string;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, formatPhone }) => {
  return (
    <div
      className={`bg-gray-50/5 backdrop-blur-sm rounded-xl border p-4 hover:bg-gray-50/10 transition-all ${
        client.is_blocked
          ? "border-red-500/50"
          : "border-emerald-500/20 hover:border-emerald-400/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
              client.is_blocked
                ? "bg-red-500/20 text-red-400"
                : "bg-linear-to-br from-emerald-400 to-emerald-600"
            }`}
          >
            {client.name ? client.name[0] : "?"}
          </div>
          <div className="text-right">
            <h3 className="font-bold text-white">
              {client.name}
              {client.is_blocked ? (
                <span className="text-xs text-red-400 mr-2">بلاک شده</span>
              ) : (
                ""
              )}
            </h3>
            <p className="text-xs text-gray-400">{formatPhone(client.phone)}</p>
            {client.last_booking_date && (
              <p className="text-xs text-emerald-400 mt-1">{client.total_bookings} نوبت</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-xs text-gray-500">آخرین مراجعه</p>
            <p className="text-sm font-bold text-emerald-400">
              {client.lastVisit || "ندارد"}
            </p>
          </div>
          <Link
            href={`/clientdashboard/customers/profile/${encodeURIComponent(
              client.phone
            )}`}
            className="bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 hover:from-emerald-600 hover:to-emerald-700"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};