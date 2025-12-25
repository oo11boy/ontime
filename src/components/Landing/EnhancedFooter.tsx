"use client";

import { Instagram, Linkedin, Mail, MapPin, MessageSquare, Phone, Send, ExternalLink, ShieldCheck } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image';

export default function EnhancedFooter(): React.JSX.Element {
  const currentYear = new Date().toLocaleDateString('fa-IR', { year: 'numeric' });

  return (
    <footer className="bg-slate-950 text-slate-500 py-24 border-t border-white/5 relative overflow-hidden" dir="rtl">
      {/* المان تزیینی در پس‌زمینه فوتر */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          
          {/* بخش برندینگ و شعار پلتفرم */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4 text-white group">
              <Image src='/icons/icon-192.png' width={100} height={100} alt='نرم افزار نوبت دهی آنتایم' className="w-16 h-16 bg-linear-to-br rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-xl  group-hover:scale-105 transition-transform duration-500">
                
              </Image>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter">آنتایم</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  OnTime Scheduling Platform
                </span>
              </div>
            </Link>
            
            <p className="max-w-sm leading-relaxed text-lg text-slate-400 font-medium">
              ما در <strong>اپلیکیشن نوبت دهی آنتایم</strong> با هوشمندسازی فرآیند رزرو، به شما کمک می‌کنیم تا زمان خود را مدیریت کرده و درآمدتان را افزایش دهید. نظم شما، اعتبار بیزینس شماست.
            </p>

            {/* شبکه‌های اجتماعی مدرن */}
            <div className="flex gap-4">
              <SocialIcon icon={<Instagram size={20} />} label="Instagram" hoverColor="hover:bg-pink-600" />
              <SocialIcon icon={<Send size={20} />} label="Telegram" hoverColor="hover:bg-blue-500" />
              <SocialIcon icon={<Linkedin size={20} />} label="Linkedin" hoverColor="hover:bg-blue-700" />
              <SocialIcon icon={<MessageSquare size={20} />} label="WhatsApp" hoverColor="hover:bg-green-600" />
            </div>
          </div>

          {/* دسته‌بندی محصولات و خدمات */}
          <div>
            <FooterHeader title="محصولات" color="bg-blue-500" />
            <ul className="space-y-4 font-bold text-sm">
              <FooterLink href="#">پنل مدیریت پزشکان</FooterLink>
              <FooterLink href="#">سیستم رزرو آرایشگاه</FooterLink>
              <FooterLink href="#">نوبت‌دهی مراکز آموزشی</FooterLink>
              <FooterLink href="#">رزرو مجموعه‌های ورزشی</FooterLink>
              <FooterLink href="#">خدمات فنی و خودرو</FooterLink>
            </ul>
          </div>

          {/* منابع و پشتیبانی */}
          <div>
            <FooterHeader title="راهنما و منابع" color="bg-indigo-500" />
            <ul className="space-y-4 font-bold text-sm">
              <FooterLink href="#">مرکز آموزش و مستندات</FooterLink>
              <FooterLink href="#">وبلاگ و اخبار تکنولوژی</FooterLink>
              <FooterLink href="#">سوالات متداول (FAQ)</FooterLink>
              <FooterLink href="#">قوانین و حریم خصوصی</FooterLink>
              <FooterLink href="#">دریافت نمایندگی</FooterLink>
            </ul>
          </div>

          {/* اطلاعات تماس و لوکیشن */}
          <div>
            <FooterHeader title="ارتباط با ما" color="bg-emerald-500" />
            <ul className="space-y-6 font-bold text-sm">
              <li className="flex items-center gap-4 group cursor-pointer text-slate-400 hover:text-white transition-all">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <Phone size={18} />
                </div>
                <span className="tabular-nums text-base">۰۹۹۸۱۳۹۴۸۳۲</span>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer text-slate-400 hover:text-white transition-all">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <Mail size={18} />
                </div>
                <span className="text-sm">unicodewebdesign@gmail.com</span>
              </li>
              {/* <li className="flex items-start gap-4 text-slate-400 leading-relaxed group">
                <div className="bg-white/5 p-2.5 rounded-xl mt-1 shrink-0">
                  <MapPin size={18} />
                </div>
                <span className="text-xs group-hover:text-slate-300 transition-colors">
                  تهران، سعادت آباد، خیابان سرو غربی، پلاک ۱۰۰، واحد ۵
                </span>
              </li> */}
              
              {/* بخش نمادهای اعتماد (Placeholder) */}
              <li className="pt-4 flex gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                   <ShieldCheck size={32} className="opacity-40" />
                </div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer text-[8px] text-center p-2 leading-tight">
                   ای‌نماد
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* نوار کپی‌رایت و استانداردهای فنی */}
        <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <ComplianceBadge text="ISO 27001 Certified" />
            <ComplianceBadge text="PCI DSS Security" />
            <ComplianceBadge text="SSL Encryption" />
            <ComplianceBadge text="Hosted in Iran" />
          </div>
          
          <div className="flex flex-col items-center lg:items-end gap-2">
            <p className="text-[11px] font-black text-slate-600 tracking-wide">
              © {currentYear} تمامی حقوق برای پلتفرم نوبت‌دهی آنتایم محفوظ است.
            </p>
            <p className="text-[9px] font-bold text-slate-700">
               طراحی و توسعه با تکنولوژی‌های مدرن ابری توسط   <a href="https://unicodewebdesign.com" target="_blank" title='تیم طراحی سایت و اپلیکیشن یونیکد'>تیم برنامه نویسی یونیکد</a>
           
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// کامپوننت‌های کمکی برای ساختار تمیزتر
function FooterHeader({ title, color }: { title: string, color: string }) {
  return (
    <h4 className="text-white font-black text-xl mb-10 flex items-center gap-3">
      <span className={`w-1.5 h-6 ${color} rounded-full`}></span>
      {title}
    </h4>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-2 hover:text-blue-400 transition-all duration-300">
        <span className="w-0 group-hover:w-4 h-0.5 bg-blue-500 transition-all duration-300"></span>
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, hoverColor, label }: { icon: React.ReactNode, hoverColor: string, label: string }) {
  return (
    <div 
      aria-label={label}
      className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 transition-all duration-500 cursor-pointer ${hoverColor} hover:text-white hover:-translate-y-2 shadow-lg shadow-black/20`}
    >
      {icon}
    </div>
  );
}

function ComplianceBadge({ text }: { text: string }) {
  return (
    <span className="text-[9px] font-black text-slate-500 border border-white/5 bg-white/2 px-4 py-1.5 rounded-lg uppercase tracking-widest hover:border-blue-500/30 transition-colors cursor-default">
      {text}
    </span>
  );
}