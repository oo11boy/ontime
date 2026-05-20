// File Path: src\app\(client pages)\clientdashboard\components\Loading.tsx

import { Zap } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1e26] dark:to-[#242933] transition-colors">
      <div className="flex items-center gap-4 text-slate-800 dark:text-white">
        <Zap className="animate-spin w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        <span className="text-lg font-medium">در حال بارگذاری...</span>
      </div>
    </div>
  )
}