"use client";

import React, { useState, useRef } from 'react';
import { 
  Search, Plus, FileCheck, X, 
  Upload, Calendar, DollarSign, ChevronDown 
} from 'lucide-react';

export default function PaymentProofPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk memicu jendela open file komputer
  const handleOpenFolder = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* --- CONTROL BAR --- */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#252525] p-3 rounded-lg border border-gray-800">
        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search payment proof..." 
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg w-full pl-10 pr-4 py-2 text-xs outline-none focus:border-[#4fd1c5]"
          />
        </div>
        
        <div className="flex bg-[#1a1a1a] p-1 rounded-md border border-gray-800">
          {['All', 'Verified', 'Pending'].map((f) => (
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
          className="ml-auto bg-[#287d7d] hover:bg-[#319797] text-white px-5 py-2 rounded text-xs font-black transition-all shadow-lg uppercase flex items-center gap-2"
        >
          <Plus size={16} /> Add Payment Proof
        </button>
      </div>

      {/* --- EMPTY STATE --- */}
      <div className="bg-[#252525] border border-gray-800 rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[450px] shadow-inner">
        <div className="bg-[#1a1a1a] p-8 rounded-full mb-6 border border-gray-800">
          <FileCheck size={48} className="text-gray-700 opacity-40" />
        </div>
        <h3 className="text-white font-bold text-lg uppercase tracking-tighter">No payment proof found</h3>
        <p className="text-gray-500 text-xs mt-2 max-w-xs">You haven't uploaded any payment confirmations from clients yet.</p>
      </div>

      {/* --- MODAL ADD PAYMENT PROOF --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-sm">
          <div className="bg-[#252525] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl flex flex-col animate-in zoom-in duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#2a2a2a]/30">
              <div className="flex items-center gap-3">
                <div className="bg-[#4fd1c5]/10 p-2 rounded-lg text-[#4fd1c5]">
                  <FileCheck size={20} />
                </div>
                <h2 className="text-white text-lg font-black uppercase tracking-tight">Add Payment Proof</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Select Invoice</label>
                <div className="relative">
                  <select className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-gray-400 outline-none appearance-none focus:border-[#4fd1c5]">
                    <option>Select Related Invoice</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-gray-600 pointer-events-none" size={16}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Payment Date</label>
                  <div className="relative">
                    <input type="date" className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-white outline-none focus:border-[#4fd1c5]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Amount Paid</label>
                  <div className="relative">
                    <input type="number" placeholder="0.00" className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-white outline-none focus:border-[#4fd1c5]" />
                    <DollarSign className="absolute right-4 top-4 text-gray-600" size={16}/>
                  </div>
                </div>
              </div>

              {/* AREA UPLOAD - AKTIF KLIK OPEN FOLDER */}
              <div className="pt-4 space-y-2">
                <label className="text-[10px] text-[#4fd1c5] font-black uppercase tracking-widest">Upload Receipt / Image</label>
                <div 
                  onClick={handleOpenFolder}
                  className="border-2 border-dashed border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center bg-[#1a1a1a]/40 hover:border-[#4fd1c5]/50 hover:bg-[#1a1a1a]/60 transition-all cursor-pointer group"
                >
                  <div className="bg-[#2dcdc1]/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="text-[#4fd1c5]" size={28} />
                  </div>
                  <p className="text-sm text-white font-medium">Click to upload proof of payment</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold lowercase tracking-normal italic">
                    (PNG, JPG, or PDF up to 10MB)
                  </p>
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={(e) => {
                      if(e.target.files?.[0]) {
                        alert("File selected: " + e.target.files[0].name);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 flex justify-end gap-4 bg-[#1a1a1a]/50">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-[#2dcdc1] hover:bg-[#25b5ab] text-[#1a1a1a] px-10 py-3 rounded-xl text-xs font-black uppercase shadow-xl transition-all active:scale-95">
                Submit Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}