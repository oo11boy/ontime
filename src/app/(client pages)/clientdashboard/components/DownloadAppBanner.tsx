// src/app/components/DownloadAppBanner.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check, Loader2 } from 'lucide-react';

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
    
    if (!android) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  
    const checkDownloadStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/client/app-download');
        const data = await response.json();
        console.log(data)
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
    
    const downloadLink = '/app/ontime.apk';
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = 'ontime.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
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

  if (isLoading) return null;
  if (!isAndroid) return null;

  return (
    <>
      {isVisible && (
        <div className=" w-full z-50  max-w-sm md:max-w-md animate-slide-up">
          <div className="bg-white dark:bg-[#1a1e26] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {/* آیکون اپلیکیشن */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* متن */}
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-800 dark:text-white font-semibold text-sm">
                  اپلیکیشن اندروید آنتایم
                  <span className="mr-1 text-xs text-emerald-500 dark:text-emerald-400">(Android)</span>
                </h4>
                <p className="text-slate-500 dark:text-gray-400 text-xs truncate">
                  مدیریت نوبت‌دهی حرفه‌ای در موبایل شما
                </p>
              </div>

              {/* دکمه دانلود */}
              <button
                onClick={handleDownload}
                disabled={isDownloading || downloadComplete}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${downloadComplete 
                    ? 'bg-emerald-500 dark:bg-emerald-600 text-white cursor-default' 
                    : 'bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-95 shadow-sm'
                  }
                  disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center gap-1.5
                `}
              >
                {downloadComplete ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>دانلود شد</span>
                  </>
                ) : isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال دانلود</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>دانلود</span>
                  </>
                )}
              </button>

              {/* دکمه بستن */}
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* نوار پیشرفت دانلود */}
            {isDownloading && (
              <div className="mt-2 h-0.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
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
            transform: translateY(20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default DownloadAppBanner;