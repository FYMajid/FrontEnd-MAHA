"use client";

import React, { useState, useRef } from 'react';
import { 
  Search, Plus, Clock, Calendar, 
  ChevronDown, FileText, Download, 
  DollarSign, X, Upload, Play, Square
} from 'lucide-react';

export default function CostJournalPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'Expense' | 'Time' | null>(null);

  // State untuk Add Time (Timer)
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFolder = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-200 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
            <div className="flex flex-col gap-0.5">
               <div className="flex gap-0.5"><div className="w-1.5 h-1.5 bg-[#4fd1c5] rounded-full"/><div className="w-1.5 h-1.5 bg-gray-600 rounded-full"/></div>
               <div className="flex gap-0.5"><div className="w-1.5 h-1.5 bg-gray-600 rounded-full"/><div className="w-1.5 h-1.5 bg-[#4fd1c5] rounded-full"/></div>
            </div>
            Cost Journal
          </h1>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#287d7d] hover:bg-[#319797] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-all shadow-lg"
            >
              <Plus size={18} /> Add Cost Journal <ChevronDown size={14} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#252525] border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                <button onClick={() => { setModalType('Expense'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-[#1a1a1a] flex items-center gap-2 transition-colors">Add Expense</button>
                <button onClick={() => { setModalType('Time'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-[#1a1a1a] flex items-center gap-2 transition-colors">Add Time</button>
              </div>
            )}
          </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="bg-[#252525] p-3 rounded-lg border border-gray-800 flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button className="bg-[#2dcdc1] text-[#1a1a1a] px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2"><Clock size={14}/> Time Entries</button>
            <button className="text-gray-400 hover:text-white px-4 py-1.5 flex items-center gap-2 text-xs font-bold transition-colors"><Calendar size={14}/> Timesheet</button>
          </div>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
            <input type="text" placeholder="Search cost journal" className="bg-[#1a1a1a] border border-gray-700 rounded w-full pl-10 pr-4 py-2 text-sm outline-none focus:border-[#4fd1c5]" />
          </div>
          <div className="flex bg-[#1a1a1a] p-1 rounded-md border border-gray-800">
            {['All', 'Expense', 'Time'].map((f) => (
              <button key={f} onClick={() => setActiveTab(f)} className={`px-4 py-1 rounded text-xs font-black uppercase tracking-widest transition-all ${activeTab === f ? 'bg-[#2dcdc1] text-[#1a1a1a]' : 'text-gray-500 hover:text-white'}`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-auto text-gray-400">
            <button className="flex items-center gap-1 text-xs font-bold uppercase hover:text-white"><Download size={14}/> Export</button>
            <button className="flex items-center gap-1 text-xs font-bold uppercase hover:text-white"><Calendar size={14}/> Period</button>
          </div>
        </div>

        {/* --- EMPTY STATE --- */}
        <div className="bg-[#252525] border border-gray-800 rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex flex-col gap-2 mb-6">
             <div className="flex gap-2 items-center"><div className="w-8 h-4 bg-red-500/20 border border-red-500/40 rounded flex items-center justify-center"><X size={10} className="text-red-500"/></div><div className="w-20 h-3 bg-gray-800 rounded"/></div>
             <div className="flex gap-2 items-center"><div className="w-8 h-4 bg-[#4fd1c5]/20 border border-[#4fd1c5]/40 rounded flex items-center justify-center"><Clock size={10} className="text-[#4fd1c5]"/></div><div className="w-20 h-3 bg-gray-800 rounded"/></div>
             <div className="flex gap-2 items-center"><div className="w-8 h-4 bg-[#4fd1c5]/20 border border-[#4fd1c5]/40 rounded flex items-center justify-center"><Clock size={10} className="text-[#4fd1c5]"/></div><div className="w-20 h-3 bg-gray-800 rounded"/></div>
          </div>
          <h3 className="text-white font-bold text-lg">No cost journal found</h3>
          <div className="flex gap-4 mt-2">
            <button onClick={() => setModalType('Expense')} className="text-gray-500 hover:text-[#4fd1c5] text-sm">Add Expense</button>
            <button onClick={() => setModalType('Time')} className="text-gray-500 hover:text-[#4fd1c5] text-sm">Add Time</button>
          </div>
        </div>
      </div>

      {/* --- MODAL LOGIC --- */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-sm">
          <div className="bg-[#252525] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#4fd1c5]/10 p-2 rounded-lg text-[#4fd1c5]">
                  <Clock size={20} />
                </div>
                <h2 className="text-[#4fd1c5] text-lg font-bold">Add {modalType}</h2>
              </div>
              {modalType === 'Time' && (
                <div className="flex items-center gap-4 text-white font-mono text-lg">
                  00:00:00 <Play size={20} className="fill-white cursor-pointer"/> <Square size={18} className="fill-gray-600 text-gray-600 cursor-pointer"/>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              
              {/* Timer UI for Add Time */}
              {modalType === 'Time' && (
                <div className="flex justify-center items-center gap-8 py-4">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-600 text-xs">2 Hours</span>
                    <span className="text-gray-400 text-sm">1 Hours</span>
                    <div className="bg-gray-800/50 px-6 py-2 rounded-xl text-white font-bold text-xl border border-gray-700">0 Hours</div>
                    <span className="text-gray-400 text-sm">1 Hours</span>
                    <span className="text-gray-600 text-xs">2 Hours</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-600 text-xs">2 Minutes</span>
                    <span className="text-gray-400 text-sm">1 Minutes</span>
                    <div className="bg-gray-800/50 px-6 py-2 rounded-xl text-white font-bold text-xl border border-gray-700">0 Minutes</div>
                    <span className="text-gray-400 text-sm">1 Minutes</span>
                    <span className="text-gray-600 text-xs">2 Minutes</span>
                  </div>
                </div>
              )}

              {/* Billable Toggle */}
              <div className="flex bg-[#1a1a1a] w-fit p-1 rounded-lg border border-gray-800">
                <button className="bg-[#2dcdc1] text-[#1a1a1a] px-4 py-1.5 rounded-md text-xs font-bold tracking-tight">Billable</button>
                <button className="text-gray-500 px-4 py-1.5 text-xs font-bold">Non-Billable</button>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-gray-400 outline-none appearance-none"><option>Matter</option></select>
                  <ChevronDown className="absolute right-4 top-3.5 text-gray-600 pointer-events-none" size={16}/>
                </div>
                <div className="relative">
                  <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-gray-400 outline-none appearance-none"><option>Category</option></select>
                  <ChevronDown className="absolute right-4 top-3.5 text-gray-600 pointer-events-none" size={16}/>
                </div>

                {modalType === 'Time' && (
                  <div className="relative">
                    <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-gray-400 outline-none appearance-none"><option>Matter Member</option></select>
                    <ChevronDown className="absolute right-4 top-3.5 text-gray-600 pointer-events-none" size={16}/>
                  </div>
                )}

                <div className="relative">
                  <input type="text" placeholder="Date" className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-white outline-none" />
                  <Calendar className="absolute right-4 top-3.5 text-gray-600 pointer-events-none" size={16}/>
                </div>

                {modalType === 'Expense' ? (
                  <>
                    <input type="text" placeholder="Total Cost" className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-white outline-none" />
                    <input type="text" placeholder="Quantity" className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-white outline-none" />
                  </>
                ) : (
                  <>
                    <div className="relative">
                       <input type="text" placeholder="Hourly Price" className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-white outline-none" />
                       <span className="absolute right-4 top-3.5 text-gray-500 border-l border-gray-700 pl-3">Per Hour</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#4fd1c5] font-bold uppercase tracking-widest">Total Cost</label>
                      <div className="text-white font-bold text-lg">IDR 0.00</div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-white text-xs">Custom Fee</span>
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-800 bg-[#1a1a1a] accent-[#2dcdc1]" />
                    </label>
                  </>
                )}

                <textarea placeholder="Description" rows={3} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-white outline-none resize-none" />
              </div>

              {/* Upload Section - AKTIF KLIK OPEN FILE */}
              {modalType === 'Expense' && (
                <div className="pt-4 space-y-2 border-t border-gray-800">
                  <label className="text-[11px] uppercase font-black text-[#4fd1c5] tracking-widest">Upload Proof</label>
                  <div 
                    onClick={handleOpenFolder}
                    className="border-2 border-dashed border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center bg-[#1a1a1a]/40 hover:border-[#4fd1c5]/50 transition-all cursor-pointer group"
                  >
                    <div className="bg-[#2dcdc1]/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-[#4fd1c5]" size={28} />
                    </div>
                    <p className="text-sm text-white font-medium">Select or drag and drop your files here</p>
                    <p className="text-[10px] text-gray-500 mt-2 font-bold">(Up to 5GB)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={(e) => console.log(e.target.files?.[0]?.name)} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-[#1a1a1a]/80 flex justify-end items-center gap-4 border-t border-gray-800">
              <button onClick={() => setModalType(null)} className="px-6 py-2 text-gray-500 hover:text-white transition font-bold uppercase tracking-widest text-[11px]">Cancel</button>
              <button className="px-10 py-3 bg-[#2dcdc1] hover:bg-[#25b5ab] text-[#1a1a1a] font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}