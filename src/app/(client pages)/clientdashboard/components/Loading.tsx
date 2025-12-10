import { Zap } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a1e26] to-[#242933]">
        <div className="flex items-center gap-4 text-white">
          <Zap className="animate-spin w-10 h-10 text-emerald-400" />
          <span className="text-lg font-medium">در حال بارگذاری...</span>
        </div>
      </div>
  )
}
