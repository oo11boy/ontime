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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollBy(0, -120); // جبران هدر ثابت
    }
  };

  if (headings.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow">
        <h4 className="flex items-center gap-2 font-black mb-5 text-lg">
          <List className="w-5 h-5 text-blue-600" />
          فهرست مقاله
        </h4>
        <p className="text-gray-400 text-xs">هیچ عنوان H2 یا H3 در محتوا یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow">
      <h4 className="flex items-center gap-2 font-black mb-5 text-lg">
        <List className="w-5 h-5 text-blue-600" />
        فهرست مقاله
      </h4>
      <ul className="space-y-4 text-sm text-slate-600">
        {headings.map((heading, i) => {
          const indent = heading.level === 3 ? 'pr-8' : 'pr-4';
          return (
            <li key={i} className={indent}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className="hover:text-blue-600 transition flex items-center gap-3 group"
              >
                <span className="w-2 h-2 bg-blue-600 rounded-full group-hover:scale-150 transition" />
                <span className="group-hover:underline">{heading.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}