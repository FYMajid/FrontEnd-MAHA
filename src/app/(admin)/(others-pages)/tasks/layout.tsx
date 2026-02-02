"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecks } from 'lucide-react';

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Deteksi sub-page untuk styling tab
  const isMatter = pathname.includes('/metter');
  const isLawOffice = pathname.includes('/law-office');

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-2 text-white">
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <ListChecks className="text-[#4fd1c5]" size={26} /> Tasks
          </h1>
        </div>

        {/* Tab Navigation - Navigasi instan karena berada di Shared Layout */}
        <div className="flex gap-6 border-b border-gray-800 mb-6">
          <Link 
            href="/tasks/metter"
            className={`pb-3 text-sm font-medium transition-all relative ${
              isMatter ? 'text-[#4fd1c5]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Matter Tasks
            {isMatter && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4fd1c5]" />}
          </Link>

          <Link 
            href="/tasks/law-office"
            className={`pb-3 text-sm font-medium transition-all relative ${
              isLawOffice ? 'text-[#4fd1c5]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Personal Tasks
            {isLawOffice && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4fd1c5]" />}
          </Link>
        </div>

        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}