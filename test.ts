// test.ts
import { config } from "dotenv";
import * as path from "path";

// بارگذاری متغیرهای محیطی
config({ path: ".env" });
config({ path: ".env.local" });

console.log("📋 متغیرهای محیطی بارگذاری شدند:");
console.log(`   MYSQL_HOST: ${process.env.MYSQL_HOST}`);
console.log(`   MYSQL_USER: ${process.env.MYSQL_USER}`);
console.log(`   MYSQL_DATABASE: ${process.env.MYSQL_DATABASE}`);
console.log(`   MYSQL_PASSWORD: ${process.env.MYSQL_PASSWORD ? '****' : '(خالی)'}`);

// import بعد از اطمینان از بارگذاری env
import { query } from "./src/lib/db";

async function testAllCronModes() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 شروع تست کامل Cron Job - همه حالت‌ها");
  console.log("=".repeat(70) + "\n");

  // بررسی اتصال دیتابیس
  try {
    const testQuery = await query<any>("SELECT 1 as test, NOW() as time, CURDATE() as date");
    console.log("✅ اتصال به دیتابیس برقرار است");
    console.log(`   زمان سرور: ${testQuery[0].time}`);
    console.log(`   تاریخ سرور: ${testQuery[0].date}\n`);
  } catch (error: any) {
    console.error("❌ خطا در اتصال به دیتابیس:", error.message);
    console.log("\n⚠️ لطفاً بررسی کنید:");
    console.log("   1. MySQL در حال اجرا است");
    console.log("   2. اطلاعات اتصال در .env صحیح است");
    console.log("   3. دیتابیس 'ontime' وجود دارد");
    process.exit(1);
  }

  const testPhone = "09123456789";
  let userId: number;

  // ==========================================
  // مرحله 1: آماده‌سازی کاربر تست
  // ==========================================
  console.log("📝 مرحله 1: آماده‌سازی کاربر تست");
  console.log("-".repeat(50));

  const existingUser = await query<any>(
    "SELECT id FROM users WHERE phone = ?",
    [testPhone]
  );

  if (existingUser.length === 0) {
    const result: any = await query(
      `INSERT INTO users (phone, business_name, plan_key) 
       VALUES (?, 'کسب‌وکار تست', 'basic')`,
      [testPhone]
    );
    userId = result.insertId;
    console.log("✅ کاربر تست جدید ایجاد شد:", userId);
  } else {
    userId = existingUser[0].id;
    console.log("✅ کاربر تست موجود:", userId);
  }

  // بررسی فیلدهای مورد نیاز
  try {
    await query(`SELECT has_received_expiry_notification FROM users LIMIT 1`);
  } catch (error) {
    console.log("\n⚠️ فیلد has_received_expiry_notification وجود ندارد!");
    console.log("لطفاً این کوئری را اجرا کنید:");
    console.log("ALTER TABLE users ADD COLUMN has_received_expiry_notification TINYINT(1) DEFAULT 0;");
    process.exit(1);
  }

  try {
    await query(`SELECT has_received_expired_notification FROM users LIMIT 1`);
  } catch (error) {
    console.log("\n⚠️ فیلد has_received_expired_notification وجود ندارد!");
    console.log("لطفاً این کوئری را اجرا کنید:");
    console.log("ALTER TABLE users ADD COLUMN has_received_expired_notification TINYINT(1) DEFAULT 0;");
    process.exit(1);
  }

  // ریست کردن همه فلگ‌ها
  await query(
    `UPDATE users 
     SET has_received_expiry_notification = 0,
         has_received_expired_notification = 0
     WHERE id = ?`,
    [userId]
  );
  console.log("✅ فلگ‌های کاربر ریست شدند\n");

  // ==========================================
  // مرحله 2: تست حالت expiry (2 روز قبل)
  // ==========================================
  console.log("📝 مرحله 2: تست حالت expiry (پیامک 2 روز قبل از انقضا)");
  console.log("-".repeat(50));

  // تنظیم تاریخ انقضا به 2 روز بعد
  await query(
    `UPDATE users 
     SET ended_at = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
     WHERE id = ?`,
    [userId]
  );

  const userExpiry = await query<any>(
    "SELECT ended_at, DATEDIFF(ended_at, CURDATE()) as days_left FROM users WHERE id = ?",
    [userId]
  );
  console.log(`📅 تاریخ انقضا: ${userExpiry[0].ended_at}`);
  console.log(`📊 روزهای باقیمانده: ${userExpiry[0].days_left}`);
  console.log(`📤 ارسال درخواست به API...`);

  try {
    const expiryRes = await fetch("http://localhost:3000/api/cron/check-expiry?type=expiry");
    const expiryResult = await expiryRes.json();
    console.log("📊 نتیجه:");
    console.log(`   - موفقیت: ${expiryResult.success}`);
    console.log(`   - کل کاربران: ${expiryResult.total}`);
    console.log(`   - ارسال شده: ${expiryResult.sent}`);
    console.log(`   - ناموفق: ${expiryResult.failed}`);
    if (expiryResult.error) {
      console.log(`   - خطا: ${expiryResult.error}`);
    }
  } catch (error: any) {
    console.log("❌ خطا در ارتباط با سرور Next.js");
    console.log("   لطفاً ابتدا سرور را با 'npm run dev' اجرا کنید");
    console.log(`   خطا: ${error.message}`);
  }
  console.log("");

  // ==========================================
  // مرحله 3: تست حالت expired (پس از انقضا)
  // ==========================================
  console.log("📝 مرحله 3: تست حالت expired (پیامک پس از اتمام اشتراک)");
  console.log("-".repeat(50));

  // تنظیم تاریخ انقضا به دیروز و فلگ expiry را 1 کنید
  await query(
    `UPDATE users 
     SET ended_at = DATE_SUB(CURDATE(), INTERVAL 1 DAY),
         has_received_expiry_notification = 1
     WHERE id = ?`,
    [userId]
  );

  const userExpired = await query<any>(
    "SELECT ended_at, DATEDIFF(CURDATE(), ended_at) as days_ago FROM users WHERE id = ?",
    [userId]
  );
  console.log(`📅 تاریخ انقضا: ${userExpired[0].ended_at}`);
  console.log(`📊 روزهای گذشته: ${userExpired[0].days_ago} روز پیش`);
  console.log(`📤 ارسال درخواست به API...`);

  try {
    const expiredRes = await fetch("http://localhost:3000/api/cron/check-expiry?type=expired");
    const expiredResult = await expiredRes.json();
    console.log("📊 نتیجه:");
    console.log(`   - موفقیت: ${expiredResult.success}`);
    console.log(`   - کل کاربران: ${expiredResult.total}`);
    console.log(`   - ارسال شده: ${expiredResult.sent}`);
    console.log(`   - ناموفق: ${expiredResult.failed}`);
  } catch (error) {
    console.log("❌ خطا در ارتباط با سرور");
  }
  console.log("");

  // ==========================================
  // مرحله 4: تست حالت retry (ارسال مجدد)
  // ==========================================
  console.log("📝 مرحله 4: تست حالت retry (ارسال مجدد ناموفق‌ها)");
  console.log("-".repeat(50));

  await query(
    `UPDATE users 
     SET has_received_expiry_notification = 0,
         has_received_expired_notification = 0,
         ended_at = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
     WHERE id = ?`,
    [userId]
  );
  console.log(`📝 کاربر برای ارسال مجدد آماده شد`);
  console.log(`📤 ارسال درخواست به API...`);

  try {
    const retryRes = await fetch("http://localhost:3000/api/cron/check-expiry?type=retry");
    const retryResult = await retryRes.json();
    console.log("📊 نتیجه:");
    console.log(`   - موفقیت: ${retryResult.success}`);
    if (retryResult.expiry) {
      console.log(`   - expiry: ${retryResult.expiry.total} کاربر, موفق: ${retryResult.expiry.success}`);
    }
    if (retryResult.expired) {
      console.log(`   - expired: ${retryResult.expired.total} کاربر, موفق: ${retryResult.expired.success}`);
    }
  } catch (error) {
    console.log("❌ خطا در ارتباط با سرور");
  }
  console.log("");

  // ==========================================
  // مرحله 5: تست حالت all
  // ==========================================
  console.log("📝 مرحله 5: تست حالت all (اجرای همزمان هر دو نوع)");
  console.log("-".repeat(50));

  await query(
    `UPDATE users 
     SET ended_at = DATE_ADD(CURDATE(), INTERVAL 2 DAY),
         has_received_expiry_notification = 0,
         has_received_expired_notification = 0
     WHERE id = ?`,
    [userId]
  );
  console.log(`📤 ارسال درخواست به API...`);

  try {
    const allRes = await fetch("http://localhost:3000/api/cron/check-expiry?type=all");
    const allResult = await allRes.json();
    console.log("📊 نتیجه:");
    console.log(`   - موفقیت: ${allResult.success}`);
    if (allResult.expiry) {
      console.log(`   - expiry: کل=${allResult.expiry.total}, موفق=${allResult.expiry.sent}`);
    }
    if (allResult.expired) {
      console.log(`   - expired: کل=${allResult.expired.total}, موفق=${allResult.expired.sent}`);
    }
  } catch (error) {
    console.log("❌ خطا در ارتباط با سرور");
  }
  console.log("");

  // ==========================================
  // مرحله 6: بررسی نتایج نهایی
  // ==========================================
  console.log("📝 مرحله 6: بررسی نتایج نهایی");
  console.log("-".repeat(50));

  const finalUser = await query<any>(
    `SELECT id, phone, business_name, ended_at,
            has_received_expiry_notification,
            has_received_expired_notification
     FROM users WHERE id = ?`,
    [userId]
  );
  console.log("📊 وضعیت نهایی کاربر:");
  console.table(finalUser);

  const logs = await query<any>(
    `SELECT sms_type, to_phone, status, created_at 
     FROM smslog 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 10`,
    [userId]
  );
  
  console.log("\n📊 آخرین پیامک‌های ارسال شده:");
  if (logs.length > 0) {
    console.table(logs);
  } else {
    console.log("❌ هیچ پیامکی ارسال نشده است");
  }

  console.log("\n✅ تست کامل شد!");
  process.exit(0);
}

testAllCronModes().catch((error) => {
  console.error("❌ خطا در اجرای تست:", error);
  process.exit(1);
});