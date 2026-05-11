// src/lib/platform.ts
export type Platform = 'web' | 'bazaar_webview';

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isBazaarWebview = userAgent.includes('cafebazaar') || 
                          userAgent.includes('com.farsitel.bazaar') ||
                          !!(window as any).bazaarPaymentHandler;
                          
  return isBazaarWebview ? 'bazaar_webview' : 'web';
}