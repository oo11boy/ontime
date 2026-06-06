// lib/subscription-notification.ts
import { query } from "@/lib/db";

const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
const SENDER_NUMBER = process.env.SENDER_NUMBER;
const EXPIRY_PATTERN_CODE = "e9fg5vj38lyd95q"; // 2 روز قبل
const EXPIRED_PATTERN_CODE = "v3zqiwml7vxdsbe"; // پس از اتمام اشتراک

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

// تابع ارسال هشدار به ادمین
async function sendAdminAlert(message: string, type: 'warning' | 'error' = 'warning') {
  console.log(`🚨 ${type.toUpperCase()}: ${message}`);
}

// تابع اصلی چک و ارسال پیامک‌های 2 روز قبل
export async function checkAndSendExpiryNotifications() {
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
      return { 
        success: true, 
        total: 0, 
        sent: 0, 
        failed: 0,
        duration: Date.now() - startTime
      };
    }

    if (totalCount > 100) {
      await sendAdminAlert(`⚠️ تعداد ${totalCount} کاربر در حال انقضا! لطفاً بررسی شود.`, 'warning');
    }

    let successCount = 0;
    let failCount = 0;
    const failedUsers: number[] = [];
    
    const batches = Math.ceil(totalCount / BATCH_SIZE);
    console.log(`📦 تعداد دسته‌ها: ${batches} (هر دسته ${BATCH_SIZE} نفر)`);

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
          return { userId: user.id, success: true };
        } else {
          console.log(`  ❌ خطا در ارسال پیامک اطلاع‌رسانی به ${user.phone}`);
          return { userId: user.id, success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          failedUsers.push(result.userId);
        }
      }
      
      if (batchIndex < batches - 1) {
        console.log(`⏳ تأخیر ${DELAY_BETWEEN_BATCHES / 1000} ثانیه قبل از دسته بعدی...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    const duration = Date.now() - startTime;
    console.log("\n=== گزارش نهایی (اطلاع‌رسانی) ===");
    console.log(`⏱️ زمان اجرا: ${(duration / 1000).toFixed(2)} ثانیه`);
    console.log(`📊 کل کاربران: ${totalCount}`);
    console.log(`✅ موفق: ${successCount}`);
    console.log(`❌ ناموفق: ${failCount}`);
    console.log(`📈 نرخ موفقیت: ${((successCount / totalCount) * 100).toFixed(2)}%`);
    
    if (failCount > totalCount * 0.3) {
      await sendAdminAlert(`⚠️ نرخ شکست بالا: ${failCount} از ${totalCount} پیامک ارسال نشد!`, 'error');
    }
    
    return { 
      success: true, 
      total: totalCount, 
      sent: successCount, 
      failed: failCount,
      failedUsers,
      duration: duration,
      successRate: ((successCount / totalCount) * 100).toFixed(2)
    };
    
  } catch (error: any) {
    console.error("❌ خطای کلی:", error);
    return { 
      success: false, 
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

// تابع جدید: چک و ارسال پیامک پس از اتمام اشتراک
export async function checkAndSendExpiredNotifications() {
  const startTime = Date.now();
  console.log("=== شروع چک کردن اشتراک‌های منقضی شده ===");
  console.log(`تاریخ امروز: ${new Date().toISOString().split('T')[0]}`);
  
  try {
    // پیدا کردن کاربرانی که اشتراکشان امروز تمام شده و پیامک پس از انقضا نگرفته‌اند
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
      return { 
        success: true, 
        total: 0, 
        sent: 0, 
        failed: 0,
        duration: Date.now() - startTime
      };
    }

    if (totalCount > 100) {
      await sendAdminAlert(`⚠️ تعداد ${totalCount} کاربر با اشتراک منقضی شده! لطفاً بررسی شود.`, 'warning');
    }

    let successCount = 0;
    let failCount = 0;
    const failedUsers: number[] = [];
    
    const batches = Math.ceil(totalCount / BATCH_SIZE);
    console.log(`📦 تعداد دسته‌ها: ${batches} (هر دسته ${BATCH_SIZE} نفر)`);

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
          return { userId: user.id, success: true };
        } else {
          console.log(`  ❌ خطا در ارسال پیامک پس از انقضا به ${user.phone}`);
          return { userId: user.id, success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          failedUsers.push(result.userId);
        }
      }
      
      if (batchIndex < batches - 1) {
        console.log(`⏳ تأخیر ${DELAY_BETWEEN_BATCHES / 1000} ثانیه قبل از دسته بعدی...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    const duration = Date.now() - startTime;
    console.log("\n=== گزارش نهایی (پس از انقضا) ===");
    console.log(`⏱️ زمان اجرا: ${(duration / 1000).toFixed(2)} ثانیه`);
    console.log(`📊 کل کاربران: ${totalCount}`);
    console.log(`✅ موفق: ${successCount}`);
    console.log(`❌ ناموفق: ${failCount}`);
    console.log(`📈 نرخ موفقیت: ${((successCount / totalCount) * 100).toFixed(2)}%`);
    
    return { 
      success: true, 
      total: totalCount, 
      sent: successCount, 
      failed: failCount,
      failedUsers,
      duration: duration,
      successRate: ((successCount / totalCount) * 100).toFixed(2)
    };
    
  } catch (error: any) {
    console.error("❌ خطای کلی در ارسال پیامک پس از انقضا:", error);
    return { 
      success: false, 
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

// تابع برای ارسال مجدد (برای هر دو نوع)
export async function retryFailedNotifications() {
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