"use client";
import React from 'react';
import { List } from 'lucide-react';

interface Heading {
  id: string;
  title: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // جبران هدر ثابت
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className=" w-full transition-all duration-300">
      <div className="p-5 md:p-6 rounded-4xl bg-white border border-slate-100 shadow-xl shadow-blue-500/5 flex flex-col max-h-[calc(100vh-150px)]">
        
        {/* هدر فهرست */}
        <div className="flex items-center gap-2 font-black mb-4 text-slate-800 shrink-0">
          <div className="p-2 bg-blue-50 rounded-xl">
            <List className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-lg">فهرست مقاله</h4>
        </div>

        {/* لیست عناوین با اسکرول هوشمند */}
        <div className="overflow-y-auto pr-1 custom-scrollbar">
          {/* حالت موبایل: اسکرول افقی در صورت نیاز | حالت دسکتاپ: لیست عمودی */}
          <ul className="space-y-3 text-[13px] md:text-sm text-slate-600 pb-2">
            {headings.map((heading, i) => {
              const isLevel3 = heading.level === 3;
              return (
                <li 
                  key={i} 
                  className={`transition-all ${isLevel3 ? 'mr-6 border-r border-slate-100 pr-3' : 'font-bold text-slate-700'}`}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    className="hover:text-blue-600 transition-colors flex items-start gap-3 group py-1"
                  >
                    {!isLevel3 && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                    )}
                    <span className="group-hover:-translate-x-1 transition-transform inline-block leading-relaxed">
                      {heading.title}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* استایل سفارشی برای اسکرول‌بار داخلی فهرست */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}