// File Path: src\app\(client pages)\clientdashboard\components\ServiceControlPanel\ServiceControlPanel.tsx

import React from "react";
import PlanStatus from "./Planstatus";
import Buttons from "./Buttons";
import SmsStatus from "./SmsStatus";

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  created_at:string;
  amount_paid: number;
}

interface ServiceControlPanelProps {
  planSmsBalance: number;
  purchasedSmsBalance: number;
  purchasedPackages?: PurchasedPackage[];
  planTitle: string;
  trialEndsAt: string | null | undefined;
  planInitialSms: number;       // جدید: مقدار اولیه پلن

}

export default function ServiceControlPanel({
  planSmsBalance,
  purchasedSmsBalance,
  planInitialSms,
  purchasedPackages = [],
  planTitle,
  trialEndsAt,
}: ServiceControlPanelProps) {
  return (
    <div className="w-[95%] m-auto shadow-2xl flex flex-col items-center">
      <div className="bg-[#1B1F28] rounded-xl p-6 flex flex-col gap-6 justify-start items-center shadow-sm w-full mx-auto">
        <SmsStatus
          planSmsBalance={planSmsBalance}
          purchasedSmsBalance={purchasedSmsBalance}
          purchasedPackages={purchasedPackages}
          planInitialSms={planInitialSms}
        />
      
        <Buttons />
        <PlanStatus planTitle={planTitle} trialEndsAt={trialEndsAt} />
      </div>
    </div>
  );
}