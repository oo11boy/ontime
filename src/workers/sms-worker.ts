// src/workers/sms-worker.ts
// ← این خط رو اول از همه اضافه کن
import "dotenv/config";   // ← این باعث می‌شه .env.local لود بشه
import "../lib/sms-queue"; // فقط برای فعال شدن Worker

console.log("🚀 SMS Worker started and listening for jobs...");
