"use client";

import React, { useState } from 'react';
import { Search, Plus, Trash2, X, ChevronDown, Calendar, FileText } from 'lucide-react';

export default function DepositPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Add' | 'Refund'>('Add');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search deposit..." 
            className="bg-[#252525] border border-gray-800 rounded-lg w-full pl-10 pr-4 py-2 text-sm outline-none focus:border-[#4fd1c5]"
          />
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => { setModalType('Add'); setIsModalOpen(true); }}
             className="bg-[#287d7d] hover:bg-[#319797] text-white px-5 py-2 rounded text-xs font-black uppercase shadow-lg transition-all"
           >
             Add Deposit
           </button>
           <button 
             onClick={() => { setModalType('Refund'); setIsModalOpen(true); }}
             className="bg-transparent border border-gray-700 text-gray-400 hover:text-white px-5 py-2 rounded text-xs font-black uppercase transition-all"
           >
             Refund Deposit
           </button>
        </div>
      </div>

      <div className="bg-[#252525] border border-gray-800 rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[450px] shadow-inner">
        <div className="bg-[#1a1a1a] p-8 rounded-full mb-6">
           <div className="flex gap-2 relative">
              <FileText size={48} className="text-gray-800 opacity-50" />
              <div className="absolute top-0 right-0 bg-red-500/20 p-1 rounded-md border border-red-500/30">
                 <Trash2 size={14} className="text-red-500" />
              </div>
           </div>
        </div>
        <h3 className="text-white font-bold text-lg uppercase tracking-tighter">No deposit found</h3>
        <p className="text-gray-500 text-xs mt-2 font-medium">Click buttons above to manage client deposits.</p>
      </div>

      {/* MODAL ADD/REFUND DEPOSIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#252525] w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#2a2a2a]/30">
              <div className="flex items-center gap-3">
                <Plus size={20} className="text-[#4fd1c5]" />
                <h2 className="text-white text-lg font-black uppercase tracking-tight">{modalType} Deposit</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-5 text-sm">
               <div className="space-y-1">
                 <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Client Selection</label>
                 <select className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-gray-400 outline-none focus:border-[#4fd1c5] transition-all"><option>Select Client</option></select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Related Matter</label>
                 <select className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-gray-400 outline-none focus:border-[#4fd1c5] transition-all"><option>Select Matter</option></select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Date</label>
                   <input type="date" className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-white outline-none focus:border-[#4fd1c5]" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Amount</label>
                   <input type="number" placeholder="0.00" className="w-full bg-[#111] border border-gray-800 rounded-xl p-3.5 text-white outline-none focus:border-[#4fd1c5]" />
                 </div>
               </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end gap-4 bg-[#1a1a1a]/50">
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white">Cancel</button>
              <button className="bg-[#2dcdc1] hover:bg-[#25b5ab] text-[#1a1a1a] px-10 py-3 rounded-xl text-xs font-black uppercase shadow-lg transition-all active:scale-95">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}