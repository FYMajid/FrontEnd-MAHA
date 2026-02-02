"use client";

import React, { useState } from 'react';
import { Search, Plus, FileText, X, ChevronDown } from 'lucide-react';

export default function InvoicePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#252525] p-3 rounded-lg border border-gray-800">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search invoice..." 
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg w-full pl-10 pr-4 py-2 text-xs outline-none focus:border-[#4fd1c5]"
          />
        </div>
        <div className="flex bg-[#1a1a1a] p-1 rounded-md border border-gray-800">
          {['All', 'Draft', 'Paid', 'Unpaid'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1 rounded text-[10px] font-black uppercase transition-all ${
                activeFilter === f ? 'bg-[#2dcdc1] text-[#1a1a1a]' : 'text-gray-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="ml-auto bg-[#287d7d] hover:bg-[#319797] text-white px-5 py-2 rounded text-xs font-black transition-all shadow-lg uppercase"
        >
          Add Invoice
        </button>
      </div>

      <div className="bg-[#252525] border border-gray-800 rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[450px]">
        <div className="relative mb-6">
           <FileText size={64} className="text-gray-800" />
           <div className="absolute -top-2 -right-2 bg-[#4fd1c5]/20 p-1.5 rounded border border-[#4fd1c5]/30">
              <Plus size={16} className="text-[#4fd1c5]" />
           </div>
        </div>
        <h3 className="text-white font-bold text-lg uppercase tracking-tighter">No invoice found</h3>
        <button onClick={() => setIsModalOpen(true)} className="text-[#4fd1c5] text-xs font-bold mt-2 hover:underline">Add Invoice</button>
      </div>

      {/* SPLIT MODAL ADD INVOICE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-[96%] h-[92vh] rounded-2xl border border-gray-800 shadow-2xl flex overflow-hidden animate-in zoom-in duration-200">
            {/* Bagian Kiri: Input Data */}
            <div className="w-[45%] p-8 border-r border-gray-800 overflow-y-auto custom-scrollbar bg-[#1e1e1e]">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-[#4fd1c5] text-xl font-black uppercase tracking-tight italic">Add Invoice</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
               </div>
               <div className="space-y-5 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <select className="bg-[#111] border border-gray-800 rounded-xl p-3.5 text-gray-400 outline-none focus:border-[#4fd1c5]"><option>Contact</option></select>
                    <select className="bg-[#111] border border-gray-800 rounded-xl p-3.5 text-gray-400 outline-none focus:border-[#4fd1c5]"><option>Matter</option></select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="bg-[#111] border border-gray-800 rounded-xl p-3.5 text-white outline-none focus:border-[#4fd1c5]" />
                    <input type="text" placeholder="Invoice Number" className="bg-[#111] border border-gray-800 rounded-xl p-3.5 text-white outline-none focus:border-[#4fd1c5]" />
                  </div>
                  <div className="bg-[#252525] p-6 rounded-xl border-2 border-dashed border-gray-800 text-center text-gray-600 font-bold uppercase text-[10px]">
                    Billing Items Configuration Area
                  </div>
               </div>
            </div>
            {/* Bagian Kanan: Preview Dokumen */}
            <div className="w-[55%] bg-white p-12 overflow-y-auto shadow-inner">
               <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-10">
                    <h1 className="text-black font-black text-2xl uppercase">(Mahasiswa Hukum)</h1>
                    <p className="text-gray-500 text-xs mt-1">Nomor Telepon: - | Email: -</p>
                  </div>
                  <div className="border-t-4 border-black pt-6 flex justify-between">
                    <div className="text-xs text-black leading-relaxed">
                      <p className="font-black uppercase mb-1">Kepada Yth:</p>
                      <p className="italic text-gray-400">Recipient Name</p>
                    </div>
                    <div className="text-xs text-black text-right leading-relaxed">
                      <p className="font-bold">Nomor Invoice: <span className="font-normal text-gray-400">-</span></p>
                      <p className="font-bold">Tanggal: <span className="font-normal text-gray-400">-</span></p>
                    </div>
                  </div>
                  <div className="mt-20 border-t border-gray-200 pt-4 text-center">
                    <p className="text-gray-300 italic text-[10px]">Preview data invoice Anda akan muncul secara otomatis di sini.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}