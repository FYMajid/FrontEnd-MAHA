"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecks } from 'lucide-react';

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Deteksi sub-page untuk styling tab sesuai folder project MAHA
  const isMatter = pathname.includes('/metter');
  const isLawOffice = pathname.includes('/law-office');

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5A7ACD] rounded-2xl text-[#F5F2F2] shadow-lg shadow-[#5A7ACD]/20">
              <ListChecks size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                Tasks & Agenda
              </h1>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">
                Management Kerja Kantor Hukum
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Pure Tailwind with 4 Color Palette */}
        <div className="flex gap-8 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 mb-10 overflow-x-auto no-scrollbar">
          <Link 
            href="/tasks/metter"
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
              isMatter 
                ? 'text-[#5A7ACD] opacity-100' 
                : 'text-inherit opacity-30 hover:opacity-100'
            }`}
          >
            Matter Tasks
            {isMatter && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5A7ACD] rounded-t-full animate-in slide-in-from-bottom-1" />
            )}
          </Link>

          <Link 
            href="/tasks/law-office"
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
              isLawOffice 
                ? 'text-[#5A7ACD] opacity-100' 
                : 'text-inherit opacity-30 hover:opacity-100'
            }`}
          >
            Personal Tasks
            {isLawOffice && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5A7ACD] rounded-t-full animate-in slide-in-from-bottom-1" />
            )}
          </Link>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}