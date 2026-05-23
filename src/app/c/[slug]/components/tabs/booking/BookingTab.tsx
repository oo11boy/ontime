"use client";

import { forwardRef } from "react";
import { BusinessData } from "../../shared/types";
import CustomerPanel from "./components/CustomerPanel";

export interface CustomerPanelRef {
  openNewBookingModal: () => void;
}

interface BookingTabProps {
  business: BusinessData;
  slug: string;
}

export const BookingTab = forwardRef<CustomerPanelRef, BookingTabProps>(
  ({ business, slug }, ref) => {
    return (
      <div className="px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">نوبت دهی</h2>
          <p className="text-gray-400 text-sm">اطلاعات خود را وارد کنید</p>
        </div>
        <CustomerPanel ref={ref} business={business} slug={slug} />
      </div>
    );
  }
);

BookingTab.displayName = "BookingTab";