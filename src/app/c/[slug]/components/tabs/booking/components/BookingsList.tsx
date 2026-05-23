import { motion } from "framer-motion";
import { Calendar, Ban, Loader2, PlusCircle } from "lucide-react";
import { BookingCard } from "./BookingCard";
import { CustomerBooking } from "../../../shared/types";

interface BookingsListProps {
  isLoading: boolean;
  bookings: CustomerBooking[];
  filterStatus: string;
  slug: string;
  onRefresh: () => void;
  onFilterChange: (filter: string) => void;
  onNewBooking: () => void;
}

export function BookingsList({
  isLoading,
  bookings,
  filterStatus,
  slug,
  onRefresh,
  onFilterChange,
  onNewBooking,
}: BookingsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-2xl">
        {filterStatus !== "all" ? (
          <>
            <Ban className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">هیچ نوبتی با این وضعیت وجود ندارد</p>
            <button
              onClick={() => onFilterChange("all")}
              className="mt-3 text-emerald-400 text-sm hover:text-emerald-300 transition"
            >
              نمایش همه نوبت‌ها
            </button>
          </>
        ) : (
          <>
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">هیچ نوبتی ثبت نشده است</p>
            <button
              onClick={onNewBooking}
              className="mt-3 text-emerald-400 text-sm hover:text-emerald-300 transition"
            >
              ثبت نوبت جدید
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[450px] overflow-y-auto">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          slug={slug}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}