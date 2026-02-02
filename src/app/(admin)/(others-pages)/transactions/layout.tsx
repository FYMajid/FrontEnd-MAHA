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
    <div className="min-h-screen bg-[#1e1e1e] text-gray-200 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-4 text-white">
          <div className="bg-[#4fd1c5]/10 p-2 rounded-lg">
            <LayoutGrid className="text-[#4fd1c5]" size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Transactions</h1>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex gap-6 border-b border-gray-800 mb-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`pb-3 text-sm font-medium transition-all relative ${
                  isActive ? 'text-[#4fd1c5]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.name}
                {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4fd1c5]" />}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Content */}
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}