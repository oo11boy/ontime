// src/app/components/DownloadAppBanner.tsx
"use client";

import React, { useState, useEffect } from 'react';

interface DownloadAppBannerProps {
  onDownloadComplete?: () => void;
}

const DownloadAppBanner: React.FC<DownloadAppBannerProps> = ({ onDownloadComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // تشخیص سیستم‌عامل کاربر
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const android = /Android/i.test(userAgent);
    setIsAndroid(android);
    
    // اگر اندروید نیست، مستقیماً isLoading رو false کن
    if (!android) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // فقط برای کاربران اندروید وضعیت دانلود را بررسی کن
    if (!isAndroid) return;
    
    const checkDownloadStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/client/app-download');
        const data = await response.json();
        
        if (data.shouldShowBanner) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking download status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkDownloadStatus();
  }, [isAndroid]);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // باز کردن لینک دانلود APK
    const downloadLink = '/app/ontime.apk';
    
    // ایجاد عنصر <a> برای دانلود
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = 'ontime.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // ثبت وضعیت دانلود در سرور
    setTimeout(async () => {
      try {
        const response = await fetch('/api/client/app-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          setDownloadComplete(true);
          setIsDownloading(false);
          
          setTimeout(() => {
            setIsVisible(false);
            if (onDownloadComplete) onDownloadComplete();
          }, 1000);
        } else {
          setIsDownloading(false);
        }
      } catch (error) {
        setIsDownloading(false);
        console.error('Error registering download:', error);
      }
    }, 2000);
  };

  // اگر در حال بارگذاری هستیم یا کاربر اندروید نیست، چیزی نشون نده
  if (isLoading) return null;
  if (!isAndroid) return null;

  return (
    <>
      {isVisible && (
        <div className=" z-50 w-[96%] mx-auto max-w-sm md:max-w-md animate-slide-up">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-emerald-100 p-3">
            <div className="flex items-center gap-3">
              {/* آیکون اپلیکیشن */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 3v2h6V3H9zm2 18H7l4-6v6zm4-6v6h4l-4-6zm-4-8v4h4V7h-4z" />
                  </svg>
                </div>
              </div>

              {/* متن */}
              <div className="flex-1 min-w-0">
                <h4 className="text-emerald-800 font-semibold text-sm">
                  اپلیکیشن اندروید آنتایم
                  <span className="mr-1 text-xs text-emerald-500">(Android)</span>
                </h4>
                <p className="text-gray-500 text-xs truncate">
                  مدیریت نوبت‌دهی حرفه‌ای در موبایل شما
                </p>
              </div>

              {/* دکمه دانلود */}
              <button
                onClick={handleDownload}
                disabled={isDownloading || downloadComplete}
                className={`
                  flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${downloadComplete 
                    ? 'bg-green-500 text-white cursor-default' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-sm'
                  }
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {downloadComplete ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    دانلود شد
                  </span>
                ) : isDownloading ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    در حال دانلود
                  </span>
                ) : (
                  'دانلود'
                )}
              </button>

              {/* دکمه بستن */}
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* نوار پیشرفت دانلود */}
            {isDownloading && (
              <div className="mt-2 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default DownloadAppBanner;