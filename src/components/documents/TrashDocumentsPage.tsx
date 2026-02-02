"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Trash2, 
  ChevronLeft, 
  Calendar, 
  Folder as FolderIcon,
  RotateCcw,
  MoreVertical
} from 'lucide-react';

export default function TrashDocumentsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data dummy untuk simulasi (kosongkan untuk melihat empty state sesuai gambar)
  const [trashItems, setTrashItems] = useState([]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-200 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/documents" 
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-[#4fd1c5]"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
              Trash
            </h1>
          </div>
        </div>

        {/* --- FILTERS & SEARCH BAR --- */}
        <div className="bg-[#252525] p-3 rounded-lg border border-gray-800 flex flex-wrap items-center gap-4 mb-6 shadow-sm">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search document" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border border-gray-700 rounded w-full pl-10 pr-4 py-2 text-sm outline-none focus:border-[#4fd1c5] transition-all"
            />
          </div>
          
          <div className="flex bg-[#1a1a1a] p-1 rounded-md border border-gray-800">
            {['All', 'File', 'Folder'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                  activeFilter === filter ? 'bg-[#2dcdc1] text-[#1a1a1a]' : 'text-gray-500 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <button className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-tighter ml-auto transition-colors">
             <Calendar size={14} /> Period
          </button>
        </div>

        {/* --- TABLE / CONTENT AREA --- */}
        <div className="bg-[#252525] border border-gray-800 rounded-xl overflow-hidden shadow-inner min-h-[500px] flex flex-col">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2a2a2a]/50 text-gray-400 border-b border-gray-800 uppercase font-black tracking-tighter">
              <tr>
                <th className="px-5 py-4 w-20">Actions</th>
                <th className="px-5 py-4 w-20">Type</th>
                <th className="px-5 py-4">Name <span className="inline-block ml-1">↑↓</span></th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Deleted Date</th>
              </tr>
            </thead>
            <tbody>
              {trashItems.length > 0 ? (
                trashItems.map((item: any, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-[#1a1a1a]/30 transition-colors">
                    <td className="px-5 py-4">
                      <button className="text-gray-500 hover:text-[#4fd1c5] transition-colors">
                        <RotateCcw size={16} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <FolderIcon size={18} className="text-gray-600" />
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{item.name}</td>
                    <td className="px-5 py-4 text-gray-500">{item.description}</td>
                    <td className="px-5 py-4 text-gray-400">{item.deletedDate}</td>
                  </tr>
                ))
              ) : (
                /* --- EMPTY STATE (Sesuai Gambar Referensi) --- */
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative mb-6">
                        {/* Stacked Folders Icon Simulation */}
                        <div className="relative bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-xl">
                          <div className="absolute -top-4 -right-4 bg-[#2dcdc1]/20 p-2 rounded-lg border border-[#2dcdc1]/30">
                            <FolderIcon className="text-[#2dcdc1]" size={40} />
                          </div>
                          <FolderIcon className="text-gray-700 opacity-20" size={80} />
                        </div>
                      </div>
                      <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-2">
                        No trash found
                      </h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="mt-4 flex justify-between items-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">
          <p>Note: Items in trash will be automatically deleted after 30 days.</p>
          <button className="text-red-500/50 hover:text-red-500 transition-colors uppercase">
            Empty Trash Now
          </button>
        </div>
      </div>
    </div>
  );
}