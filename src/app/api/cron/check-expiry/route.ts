// app/api/cron/check-expiry/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
const SENDER_NUMBER = process.env.SENDER_NUMBER;
const EXPIRY_PATTERN_CODE = "e9fg5vj38lyd95q";
const EXPIRED_PATTERN_CODE = "v3zqiwml7vxdsbe";

// تنظیمات از env
const BATCH_SIZE = parseInt(process.env.SMS_BATCH_SIZE || "20");
const DELAY_BETWEEN_SMS = parseInt(process.env.DELAY_BETWEEN_SMS_MS || "2000");
const DELAY_BETWEEN_BATCHES = parseInt(process.env.DELAY_BETWEEN_BATCHES_MS || "10000");
const MAX_PER_RUN = parseInt(process.env.MAX_EXPIRY_SMS_PER_RUN || "500");

// تابع ارسال پیامک اطلاع‌رسانی 2 روز قبل
async function sendExpiryNotificationSms(phone: string, businessName: string, retryCount = 0): Promise<boolean> {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: IP_PANEL_API_KEY || "",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER_NUMBER,
        code: EXPIRY_PATTERN_CODE,
        recipients: [formattedPhone],
        params: { name: businessName || "مشتری عزیز" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const result = await response.json();
    
    if (result.meta?.status === true) {
      return true;
    }
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 تلاش مجدد ${retryCount + 1} برای ${phone}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendExpiryNotificationSms(phone, businessName, retryCount + 1);
    }
    
    return false;
  } catch (error) {
    console.error(`خطا در ارسال SMS برای ${phone}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 تلاش مجدد ${retryCount + 1} برای ${phone}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendExpiryNotificationSms(phone, businessName, retryCount + 1);
    }
    
    return false;
  }
}

// تابع ارسال پیامک پس از اتمام اشتراک
async function sendExpiredSubscriptionSms(phone: string, businessName: string, retryCount = 0): Promise<boolean> {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: IP_PANEL_API_KEY || "",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER_NUMBER,
        code: EXPIRED_PATTERN_CODE,
        recipients: [formattedPhone],
        params: { name: businessName || "مشتری عزیز" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const result = await response.json();
    
    if (result.meta?.status === true) {
      return true;
    }
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 تلاش مجدد ${retryCount + 1} برای ${phone}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendExpiredSubscriptionSms(phone, businessName, retryCount + 1);
    }
    
    return false;
  } catch (error) {
    console.error(`خطا در ارسال SMS (پس از انقضا) برای ${phone}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 تلاش مجدد ${retryCount + 1} برای ${phone}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendExpiredSubscriptionSms(phone, businessName, retryCount + 1);
    }
    
    return false;
  }
}

// تابع اصلی چک و ارسال پیامک‌های 2 روز قبل
async function checkAndSendExpiryNotifications() {
  const startTime = Date.now();
  console.log("=== شروع چک کردن انقضای اشتراک (2 روز قبل) ===");
  console.log(`تاریخ امروز: ${new Date().toISOString().split('T')[0]}`);
  
  try {
    const expiringUsers = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.ended_at, u.plan_key
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at > CURDATE() 
         AND DATEDIFF(u.ended_at, CURDATE()) = 2
         AND (u.has_received_expiry_notification = 0 OR u.has_received_expiry_notification IS NULL)
  
       ORDER BY u.id
       LIMIT ?`,
      [MAX_PER_RUN]
    );

    const totalCount = expiringUsers.length;
    console.log(`📊 تعداد کاربران در حال انقضا (2 روز قبل): ${totalCount}`);

    if (totalCount === 0) {
      console.log("✅ هیچ کاربری با شرط 2 روز مونده وجود ندارد");
      return { total: 0, sent: 0, failed: 0 };
    }

    let successCount = 0;
    let failCount = 0;
    
    const batches = Math.ceil(totalCount / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchStart = batchIndex * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalCount);
      const currentBatch = expiringUsers.slice(batchStart, batchEnd);
      
      console.log(`\n📦 دسته ${batchIndex + 1}/${batches} - پردازش ${currentBatch.length} کاربر...`);
      
      const batchPromises = currentBatch.map(async (user: any, idx: number) => {
        if (idx > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SMS));
        }
        
        console.log(`  📤 ارسال پیامک اطلاع‌رسانی به ${user.phone}...`);
        
        const smsSent = await sendExpiryNotificationSms(user.phone, user.business_name);
        
        if (smsSent) {
          await query(
            `INSERT INTO smslog 
              (user_id, to_phone, content, sms_type, status, created_at) 
             VALUES (?, ?, ?, 'expiry_notification', 'sent', NOW())`,
            [user.id, user.phone, `اطلاع‌رسانی انقضای اشتراک - ${user.business_name || user.phone}`]
          );
          
          await query(
            `UPDATE users SET has_received_expiry_notification = 1 WHERE id = ?`,
            [user.id]
          );
          
          console.log(`  ✅ پیامک اطلاع‌رسانی به ${user.phone} با موفقیت ارسال شد`);
          return { success: true };
        } else {
          console.log(`  ❌ خطا در ارسال پیامک اطلاع‌رسانی به ${user.phone}`);
          return { success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
      
      if (batchIndex < batches - 1) {
        console.log(`⏳ تأخیر ${DELAY_BETWEEN_BATCHES / 1000} ثانیه قبل از دسته بعدی...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    console.log(`\n📊 گزارش: کل=${totalCount}, موفق=${successCount}, ناموفق=${failCount}`);
    
    return { total: totalCount, sent: successCount, failed: failCount };
    
  } catch (error: any) {
    console.error("❌ خطای کلی:", error);
    return { total: 0, sent: 0, failed: 0, error: error.message };
  }
}

// تابع چک و ارسال پیامک پس از اتمام اشتراک
async function checkAndSendExpiredNotifications() {
  const startTime = Date.now();
  console.log("=== شروع چک کردن اشتراک‌های منقضی شده ===");
  console.log(`تاریخ امروز: ${new Date().toISOString().split('T')[0]}`);
  
  try {
    const expiredUsers = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.ended_at, u.plan_key
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at <= CURDATE()
         AND (u.has_received_expired_notification = 0 OR u.has_received_expired_notification IS NULL)
         AND u.has_received_expiry_notification = 1
       ORDER BY u.id
       LIMIT ?`,
      [MAX_PER_RUN]
    );

    const totalCount = expiredUsers.length;
    console.log(`📊 تعداد کاربران با اشتراک منقضی شده: ${totalCount}`);

    if (totalCount === 0) {
      console.log("✅ هیچ کاربری با اشتراک منقضی شده وجود ندارد");
      return { total: 0, sent: 0, failed: 0 };
    }

    let successCount = 0;
    let failCount = 0;
    
    const batches = Math.ceil(totalCount / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchStart = batchIndex * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalCount);
      const currentBatch = expiredUsers.slice(batchStart, batchEnd);
      
      console.log(`\n📦 دسته ${batchIndex + 1}/${batches} - پردازش ${currentBatch.length} کاربر...`);
      
      const batchPromises = currentBatch.map(async (user: any, idx: number) => {
        if (idx > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SMS));
        }
        
        console.log(`  📤 ارسال پیامک پس از انقضا به ${user.phone}...`);
        
        const smsSent = await sendExpiredSubscriptionSms(user.phone, user.business_name);
        
        if (smsSent) {
          await query(
            `INSERT INTO smslog 
              (user_id, to_phone, content, sms_type, status, created_at) 
             VALUES (?, ?, ?, 'expired_notification', 'sent', NOW())`,
            [user.id, user.phone, `اطلاع‌رسانی انقضای اشتراک (پس از اتمام) - ${user.business_name || user.phone}`]
          );
          
          await query(
            `UPDATE users SET has_received_expired_notification = 1 WHERE id = ?`,
            [user.id]
          );
          
          console.log(`  ✅ پیامک پس از انقضا به ${user.phone} با موفقیت ارسال شد`);
          return { success: true };
        } else {
          console.log(`  ❌ خطا در ارسال پیامک پس از انقضا به ${user.phone}`);
          return { success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
      
      if (batchIndex < batches - 1) {
        console.log(`⏳ تأخیر ${DELAY_BETWEEN_BATCHES / 1000} ثانیه قبل از دسته بعدی...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    console.log(`\n📊 گزارش پس از انقضا: کل=${totalCount}, موفق=${successCount}, ناموفق=${failCount}`);
    
    return { total: totalCount, sent: successCount, failed: failCount };
    
  } catch (error: any) {
    console.error("❌ خطای کلی در ارسال پیامک پس از انقضا:", error);
    return { total: 0, sent: 0, failed: 0, error: error.message };
  }
}

// تابع ارسال مجدد برای پیامک‌های ناموفق
async function retryFailedNotifications() {
  console.log("=== شروع ارسال مجدد برای کاربران ناموفق ===");
  
  // ارسال مجدد برای پیامک‌های 2 روز قبل
  const failedExpiryUsers = await query<any>(
    `SELECT u.id, u.phone, u.business_name, u.ended_at
     FROM users u
     WHERE u.ended_at IS NOT NULL 
       AND u.ended_at > CURDATE() 
       AND DATEDIFF(u.ended_at, CURDATE()) <= 3
       AND DATEDIFF(u.ended_at, CURDATE()) >= 1
       AND (u.has_received_expiry_notification = 0 OR u.has_received_expiry_notification IS NULL)
     ORDER BY u.id
     LIMIT 100`,
    []
  );
  
  // ارسال مجدد برای پیامک‌های پس از انقضا
  const failedExpiredUsers = await query<any>(
    `SELECT u.id, u.phone, u.business_name, u.ended_at
     FROM users u
     WHERE u.ended_at IS NOT NULL 
       AND u.ended_at <= CURDATE()
       AND u.ended_at >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
       AND (u.has_received_expired_notification = 0 OR u.has_received_expired_notification IS NULL)
     ORDER BY u.id
     LIMIT 100`,
    []
  );
  
  console.log(`📊 کاربران برای ارسال مجدد (اطلاع‌رسانی): ${failedExpiryUsers.length}`);
  console.log(`📊 کاربران برای ارسال مجدد (پس از انقضا): ${failedExpiredUsers.length}`);
  
  let expirySuccess = 0;
  let expiredSuccess = 0;
  
  // ارسال مجدد برای پیامک‌های اطلاع‌رسانی
  for (const user of failedExpiryUsers) {
    const smsSent = await sendExpiryNotificationSms(user.phone, user.business_name);
    if (smsSent) {
      await query(`UPDATE users SET has_received_expiry_notification = 1 WHERE id = ?`, [user.id]);
      expirySuccess++;
      console.log(`✅ ارسال مجدد (اطلاع‌رسانی) موفق به ${user.phone}`);
    }
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SMS));
  }
  
  // ارسال مجدد برای پیامک‌های پس از انقضا
  for (const user of failedExpiredUsers) {
    const smsSent = await sendExpiredSubscriptionSms(user.phone, user.business_name);
    if (smsSent) {
      await query(`UPDATE users SET has_received_expired_notification = 1 WHERE id = ?`, [user.id]);
      expiredSuccess++;
      console.log(`✅ ارسال مجدد (پس از انقضا) موفق به ${user.phone}`);
    }
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SMS));
  }
  
  return { 
    expiry: { total: failedExpiryUsers.length, success: expirySuccess, failed: failedExpiryUsers.length - expirySuccess },
    expired: { total: failedExpiredUsers.length, success: expiredSuccess, failed: failedExpiredUsers.length - expiredSuccess }
  };
}

// هندلر اصلی GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  
  console.log(`📢 دریافت درخواست Cron - نوع: ${type}`);
  console.log(`🕐 زمان: ${new Date().toLocaleString('fa-IR')}`);
  
  try {
    let result;
    
    if (type === "expiry") {
      result = await checkAndSendExpiryNotifications();
      return NextResponse.json({
        success: true,
        type: "expiry",
        timestamp: new Date().toISOString(),
        ...result
      });
    } 
    else if (type === "expired") {
      result = await checkAndSendExpiredNotifications();
      return NextResponse.json({
        success: true,
        type: "expired",
        timestamp: new Date().toISOString(),
        ...result
      });
    } 
    else if (type === "retry") {
      result = await retryFailedNotifications();
      return NextResponse.json({
        success: true,
        type: "retry",
        timestamp: new Date().toISOString(),
        ...result
      });
    } 
    else {
      // اجرای هر دو تابع
      const expiryResult = await checkAndSendExpiryNotifications();
      const expiredResult = await checkAndSendExpiredNotifications();
      
      return NextResponse.json({
        success: true,
        type: "all",
        timestamp: new Date().toISOString(),
        expiry: expiryResult,
        expired: expiredResult
      });
    }
    
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}