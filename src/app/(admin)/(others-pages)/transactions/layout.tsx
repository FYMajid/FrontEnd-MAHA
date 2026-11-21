"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Invoice', path: '/transactions/invoice' },
    { name: 'Payment Proof', path: '/transactions/payment-proof' },
    { name: 'Deposit', path: '/transactions/deposit' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#5A7ACD] rounded-2xl text-[#F5F2F2] shadow-lg shadow-[#5A7ACD]/20">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Transactions</h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Manajemen Keuangan Perkara MAHA</p>
          </div>
        </div>

        {/* --- SUB-MENU TABS --- */}
        <div className="flex gap-8 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 mb-10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  isActive 
                    ? 'text-[#5A7ACD] opacity-100' 
                    : 'text-inherit opacity-30 hover:opacity-100'
                }`}
              >
                {tab.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5A7ACD] rounded-t-full animate-in slide-in-from-bottom-1" />
                )}
              </Link>
            );
          })}
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}