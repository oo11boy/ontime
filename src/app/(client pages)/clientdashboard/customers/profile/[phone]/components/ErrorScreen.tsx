// components/CustomerProfile/ErrorScreen.tsx
import React from "react";
import { useRouter } from "next/navigation";

interface ErrorScreenProps {
  message?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  message = "مشتری یافت نشد" 
}) => {
  const router = useRouter();

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold mb-4">{message}</h1>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
};