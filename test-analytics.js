// test-analytics.js
const mysql = require('mysql2/promise');

async function createTestData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // پسورد خود را وارد کن
    database: 'ontime'
  });

  console.log('🔌 Connected to database');

  // پیدا کردن کاربر و لینک اختصاصی
  const [users] = await connection.execute(
    `SELECT id, phone, business_name FROM users LIMIT 1`
  );
  
  if (users.length === 0) {
    console.log('❌ هیچ کاربری در دیتابیس وجود ندارد!');
    console.log('لطفا ابتدا ثبت‌نام کنید');
    return;
  }
  
  const userId = users[0].id;
  console.log(`👤 User found: ${users[0].business_name || users[0].phone} (ID: ${userId})`);
  
  // پیدا کردن لینک اختصاصی کاربر
  let [links] = await connection.execute(
    `SELECT id, slug FROM customer_links WHERE user_id = ? AND is_deleted = 0`,
    [userId]
  );
  
  let linkId;
  if (links.length === 0) {
    console.log('⚠️ لینک اختصاصی وجود ندارد، در حال ایجاد لینک تست...');
    
    const slug = `test-${userId}-${Date.now()}`;
    const fullUrl = `ontimeapp.ir/c/${slug}`;
    
    await connection.execute(
      `INSERT INTO customer_links (user_id, slug, full_url, business_name, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [userId, slug, fullUrl, users[0].business_name || 'کسب و کار تست']
    );
    
    [links] = await connection.execute(
      `SELECT id, slug FROM customer_links WHERE user_id = ? AND is_deleted = 0`,
      [userId]
    );
    linkId = links[0].id;
    console.log(`✅ لینک تست ایجاد شد: ${slug}`);
  } else {
    linkId = links[0].id;
    console.log(`🔗 Link found: ${links[0].slug} (ID: ${linkId})`);
  }
  
  // پاک کردن دیتای قبلی برای تست تازه
  await connection.execute(`DELETE FROM link_visits WHERE link_id = ?`, [linkId]);
  await connection.execute(`DELETE FROM social_clicks WHERE link_id = ?`, [linkId]);
  console.log('🧹 Data cleared for fresh test');
  
  // ==================== ایجاد دیتای تست بازدید ====================
  console.log('\n📊 Creating test visit data...');
  
  const today = new Date();
  const devices = ['mobile', 'desktop', 'tablet'];
  const referrers = ['https://google.com', 'https://instagram.com', null, 'https://t.me', 'https://rubika.ir'];
  
  let totalVisits = 0;
  
  // بازدیدهای 30 روز گذشته
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // تعداد بازدید در این روز (تصادفی بین 3 تا 45)
    const visitsCount = Math.floor(Math.random() * 42) + 3;
    totalVisits += visitsCount;
    
    for (let j = 0; j < visitsCount; j++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      date.setHours(hour, minute, 0);
      
      const device = devices[Math.floor(Math.random() * devices.length)];
      const referrer = referrers[Math.floor(Math.random() * referrers.length)];
      const timeOnPage = Math.floor(Math.random() * 180); // 0 تا 180 ثانیه
      const sessionId = `session_${i}_${j}_${Math.random().toString(36).substring(2, 8)}`;
      
      await connection.execute(
        `INSERT INTO link_visits (link_id, user_id, session_id, device_type, referrer, time_on_page, visited_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [linkId, userId, sessionId, device, referrer, timeOnPage, date]
      );
    }
    
    if (i % 7 === 0) {
      console.log(`  ✓ ${visitsCount} visits for ${date.toLocaleDateString('fa-IR')}`);
    }
  }
  
  console.log(`✅ Total ${totalVisits} visits created!`);
  
  // ==================== ایجاد دیتای تست کلیک شبکه‌های اجتماعی ====================
  console.log('\n📱 Creating social media clicks...');
  
  const socialTypes = ['instagram', 'telegram', 'whatsapp', 'rubika', 'eitaa', 'bale', 'soroush'];
  
  for (let i = 0; i < 50; i++) {
    const socialType = socialTypes[Math.floor(Math.random() * socialTypes.length)];
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0);
    
    await connection.execute(
      `INSERT INTO social_clicks (link_id, user_id, social_type, clicked_at)
       VALUES (?, ?, ?, ?)`,
      [linkId, userId, socialType, date]
    );
  }
  
  console.log('✅ 50 social clicks created!');
  
  // ==================== بروزرسانی آمار در customer_links ====================
  console.log('\n📈 Updating statistics...');
  
  // محاسبه unique visitors
  const [uniqueResult] = await connection.execute(
    `SELECT COUNT(DISTINCT session_id) as unique_count FROM link_visits WHERE link_id = ?`,
    [linkId]
  );
  const uniqueVisitors = uniqueResult[0]?.unique_count || 0;
  
  await connection.execute(
    `UPDATE customer_links 
     SET total_visits = ?,
         unique_visitors = ?
     WHERE id = ?`,
    [totalVisits, uniqueVisitors, linkId]
  );
  
  console.log(`✅ Statistics updated: ${totalVisits} total visits, ${uniqueVisitors} unique visitors`);
  
  // ==================== نمایش خلاصه ====================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 TEST DATA CREATED SUCCESSFULLY!');
  console.log('='.repeat(50));
  console.log(`\n🔗 Your link: ontimeapp.ir/c/${links[0].slug}`);
  console.log(`📊 Analytics page: http://localhost:3000/clientdashboard/customer-link/analytics`);
  console.log(`\n💡 Tip: Try refreshing the analytics page to see the data!`);
  
  await connection.end();
  console.log('\n🔌 Connection closed');
}

// اجرا
createTestData().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});