"use client";

import React, { useState } from 'react';
import { Search, Plus, ArrowUpDown, Calendar, Scale, Menu, X } from 'lucide-react';

export default function ResponsiveMattersManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const matters = [
    {
      id: '25110002',
      title: 'Test Person 01 - 25110002 : Pidana lalu lintas',
      client: 'Test Person 01',
      attorney: 'Aufa Hajran',
      status: 'In Progress',
      dispute: 'Litigation',
      start: '05 Nov 2025',
      end: '28 Nov 2025',
      lastEdit: '28 Nov 2025'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-200 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Stack di Mobile, Row di Desktop */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-white">
            <Scale className="text-[#4fd1c5]" size={24} /> Matters
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-[#287d7d] hover:bg-[#319797] text-white px-5 py-2.5 rounded-md flex justify-center items-center gap-2 transition-all font-medium shadow-lg"
          >
            <Plus size={18} /> Add Matter
          </button>
        </div>

        {/* Search & Filter - Lebih fleksibel */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search matter" 
              className="bg-[#2a2a2a] border border-gray-700 rounded-md w-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4fd1c5] transition text-sm"
            />
          </div>
          <div className="flex bg-[#2a2a2a] rounded-md p-1 border border-gray-700 overflow-x-auto no-scrollbar">
            {['All', 'Done', 'In Progress', 'Pending'].map((filter) => (
              <button 
                key={filter}
                className={`flex-1 whitespace-nowrap px-4 py-1.5 rounded text-xs md:text-sm transition ${filter === 'All' ? 'bg-[#2dcdc1] text-[#1a1a1a] font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Wrapper Tabel Responsif */}
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-[#252525]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm min-w-[1000px]">
              <thead className="bg-[#2a2a2a] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-4 font-medium">Matters <ArrowUpDown className="inline ml-1" size={12}/></th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Responsible Attorney</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium">Dispute Resolution</th>
                  <th className="p-4 font-medium">Start Date</th>
                  <th className="p-4 font-medium">End Date</th>
                  <th className="p-4 font-medium">Last Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {matters.map((m, i) => (
                  <tr key={i} className="hover:bg-[#2d2d2d] transition group">
                    <td className="p-4 text-white font-medium max-w-xs truncate">{m.title}</td>
                    <td className="p-4">{m.client}</td>
                    <td className="p-4">{m.attorney}</td>
                    <td className="p-4 text-center">
                      <span className="bg-[#f6e05e] text-[#1a1a1a] px-2 md:px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4">{m.dispute}</td>
                    <td className="p-4 text-gray-400">{m.start}</td>
                    <td className="p-4 text-gray-400">{m.end}</td>
                    <td className="p-4 text-gray-400">{m.lastEdit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- RESPONSIVE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#252525] w-full max-w-xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col shadow-2xl border border-gray-800 animate-in slide-in-from-bottom sm:zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="text-[#4fd1c5]" size={20} />
                <h2 className="text-[#4fd1c5] text-lg font-semibold">Add Matter</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white sm:hidden">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-8 overflow-y-auto flex-1 space-y-8 no-scrollbar">
              
              <section>
                <h3 className="text-white text-[11px] font-bold mb-4 uppercase tracking-[2px] opacity-60">Matter Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 outline-none focus:border-[#4fd1c5] appearance-none">
                      <option>Client</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-[10px]">▼</div>
                  </div>
                  <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 appearance-none"><option>Responsible Attorney</option></select>
                  <input type="text" placeholder="Members" className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 outline-none focus:border-[#4fd1c5]" />
                </div>
              </section>

              <section className="border-t border-gray-800 pt-6">
                <h3 className="text-white text-[11px] font-bold mb-4 uppercase tracking-[2px] opacity-60">Matter Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 appearance-none"><option>Case Area</option></select>
                  <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 appearance-none"><option>Case Type</option></select>
                  <div className="md:col-span-2">
                    <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 appearance-none mb-4"><option>Dispute Resolution</option></select>
                    <textarea placeholder="Description" rows={3} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 outline-none focus:border-[#4fd1c5] resize-none" />
                  </div>
                </div>
              </section>

              <section className="border-t border-gray-800 pt-6">
                <h3 className="text-white text-[11px] font-bold mb-4 uppercase tracking-[2px] opacity-60">Detail Location</h3>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-400 bg-[#333] px-4 py-2.5 rounded-md hover:bg-[#444] transition text-sm font-medium">
                  <Plus size={16}/> Add Address
                </button>
              </section>

              <section className="border-t border-gray-800 pt-6">
                <h3 className="text-white text-[11px] font-bold mb-4 uppercase tracking-[2px] opacity-60">Matter Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400 appearance-none"><option>Status</option></select>
                  </div>
                  {['Start Date', 'Pending Date', 'Close Date'].map((label) => (
                    <div key={label} className="relative">
                      <input type="text" placeholder={label} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-gray-400" />
                      <Calendar className="absolute right-4 top-3 text-gray-600" size={16} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-gray-800 pt-6 flex flex-wrap gap-3 pb-4">
                <button className="flex-1 min-w-[200px] flex items-center justify-center gap-2 text-gray-400 bg-[#333] px-4 py-2.5 rounded-md text-xs font-medium"><Plus size={14}/> Add Related Contacts</button>
                <button className="flex-1 min-w-[200px] flex items-center justify-center gap-2 text-gray-400 bg-[#333] px-4 py-2.5 rounded-md text-xs font-medium"><Plus size={14}/> Add Payment Method</button>
                <button className="flex-1 min-w-[200px] flex items-center justify-center gap-2 text-gray-400 bg-[#333] px-4 py-2.5 rounded-md text-xs font-medium"><Plus size={14}/> Add Information</button>
              </section>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="p-4 bg-[#1a1a1a] flex flex-row justify-end items-center gap-3 border-t border-gray-800">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 sm:flex-none px-6 py-2.5 text-gray-400 hover:text-white transition text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 sm:flex-none px-10 py-2.5 bg-[#2dcdc1] hover:bg-[#25b5ab] text-[#1a1a1a] font-bold rounded-lg transition-all text-sm shadow-lg shadow-teal-900/10"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}