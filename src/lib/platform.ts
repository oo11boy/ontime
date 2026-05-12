// src/lib/platform.ts
export type Platform = 'web' | 'bazaar_webview';

export function detectPlatform(): Promise<Platform> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('web');
      return;
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    // 1. تشخیص اینکه آیا در WebView اپلیکیشن هستیم یا خیر
    const isWebView = userAgent.includes('wv') || 
                      userAgent.includes('webkit') && !userAgent.includes('chrome') ||
                      (window as any).chrome?.app?.isInstalled === false;
    
    // 2. اگر در WebView نیستیم → وب عادی → زیبال
    if (!isWebView) {
      resolve('web');
      return;
    }
    
    // 3. اگر در WebView هستیم → اپلیکیشن نصب شده است
    //    حالا بررسی می‌کنیم که آیا کافه بازار روی گوشی نصب است یا خیر
    
    // بررسی وجود کافه بازار از طریق User-Agent
    const hasCafeBazaar = userAgent.includes('cafebazaar') || 
                          userAgent.includes('com.farsitel.bazaar');
    
    if (hasCafeBazaar) {
      // کافه بازار نصب است → درگاه کافه بازار
      resolve('bazaar_webview');
    } else {
      // کافه بازار نصب نیست → زیبال
      resolve('web');
      // می‌توانید یک پیام هم نمایش دهید
      setTimeout(() => {
        alert('برای خرید درون برنامه‌ای، لطفاً کافه بازار را نصب کنید. در غیر این صورت از درگاه زیبال استفاده خواهد شد.');
      }, 1000);
    }
  });
}