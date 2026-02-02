"use client";

import React, { useState } from 'react';
import { 
  Search, Plus, FileText, Folder as FolderIcon, 
  ChevronDown, Trash2, Calendar, Upload, X 
} from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  // State untuk UI Utama
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'File' | 'Folder'>('File');

  // Data Dummy sesuai gambar referensi
  const data = [
    { 
      type: 'Folder', 
      name: 'Test Person 01', 
      hyperlink: '-', 
      matter: '-', 
      lastEdit: '28 Nov 2025', 
      location: '-', 
      uploadDate: '28 Nov 2025' 
    }
  ];

  const handleOpenModal = (type: 'File' | 'Folder') => {
    setModalType(type);
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-200 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white uppercase tracking-tight">
            <FolderIcon className="text-[#4fd1c5]" size={28} /> Documents
          </h1>
          <div className="flex items-center gap-4">
             <Link href="/documents/trash" className="text-gray-400 hover:text-white flex items-center gap-1 text-sm transition-colors font-medium">
                <Trash2 size={16} /> Trash
             </Link>
             
             {/* Dropdown Add Document */}
             <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-[#287d7d] hover:bg-[#319797] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-all shadow-lg"
                >
                  <Plus size={18} /> Add document <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#252525] border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
                    <button onClick={() => handleOpenModal('File')} className="w-full px-4 py-3 text-left text-sm hover:bg-[#1a1a1a] flex items-center gap-2 transition-colors">
                      Add File
                    </button>
                    <button onClick={() => handleOpenModal('Folder')} className="w-full px-4 py-3 text-left text-sm hover:bg-[#1a1a1a] flex items-center gap-2 transition-colors">
                      Add Folder
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* --- FILTERS & SEARCH BAR --- */}
        <div className="bg-[#252525] p-3 rounded-lg border border-gray-800 flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search document" 
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

        {/* --- DATA TABLE --- */}
        <div className="overflow-x-auto border border-gray-800 rounded-xl shadow-inner">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#252525] text-gray-400 border-b border-gray-800 uppercase font-black tracking-tighter">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Name <ChevronDown size={12} className="inline ml-1 text-[#4fd1c5]" /></th>
                <th className="px-5 py-4 text-center">Hyperlink</th>
                <th className="px-5 py-4">Matter <ChevronDown size={12} className="inline ml-1" /></th>
                <th className="px-5 py-4">Last Edit</th>
                <th className="px-5 py-4">Physical Storage Location</th>
                <th className="px-5 py-4">Upload Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-[#1e1e1e]">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-[#252525]/50 transition-colors group cursor-pointer">
                  <td className="px-5 py-5">
                    {item.type === 'Folder' ? <FolderIcon size={20} className="text-[#4fd1c5]/70" /> : <FileText size={20} className="text-gray-500" />}
                  </td>
                  <td className="px-5 py-5 text-white font-semibold group-hover:text-[#4fd1c5] transition-colors">{item.name}</td>
                  <td className="px-5 py-5 text-center text-gray-600">{item.hyperlink}</td>
                  <td className="px-5 py-5 text-gray-600">{item.matter}</td>
                  <td className="px-5 py-5 text-gray-400 font-medium">{item.lastEdit}</td>
                  <td className="px-5 py-5 text-gray-600 italic">{item.location}</td>
                  <td className="px-5 py-5 text-gray-400 font-medium">{item.uploadDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL ADD FILE / FOLDER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#252525] w-full max-w-xl rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#2a2a2a]/50">
              <div className="flex items-center gap-3">
                <div className="bg-[#4fd1c5]/10 p-2 rounded-lg">
                  {modalType === 'File' ? <FileText className="text-[#4fd1c5]" size={20} /> : <FolderIcon className="text-[#4fd1c5]" size={20} />}
                </div>
                <div>
                  <h2 className="text-white text-lg font-black leading-tight">Add {modalType}</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Document Management</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Select Fields sesuai Gambar */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-black text-gray-500 tracking-tighter">Contact Selection</label>
                  <select className="w-full bg-[#1a1a1a] border border-[#2dcdc1]/30 rounded-xl p-3.5 text-sm text-gray-300 outline-none appearance-none focus:border-[#4fd1c5] shadow-inner">
                    <option>Contact</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-black text-gray-500 tracking-tighter">Matter Related</label>
                  <select className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3.5 text-sm text-gray-400 outline-none appearance-none">
                    <option>Matter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-black text-gray-500 tracking-tighter">{modalType} Name</label>
                  <input 
                    type="text" 
                    placeholder={modalType === 'File' ? "Enter File Name" : "Enter Folder Name"} 
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-[#4fd1c5] transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-black text-gray-500 tracking-tighter">Physical Storage Location</label>
                  <input 
                    type="text" 
                    placeholder="Physical Location" 
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-[#4fd1c5]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-black text-gray-500 tracking-tighter">External Hyperlink</label>
                  <input 
                    type="text" 
                    placeholder="Hyperlink" 
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-[#4fd1c5]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-black text-gray-500 tracking-tighter">Description / Notes</label>
                  <textarea 
                    placeholder="Add description here..." 
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-sm text-white outline-none resize-none focus:border-[#4fd1c5]"
                  />
                </div>
              </div>

              {/* UPLOAD FILE SECTION - Hanya tampil jika tipe File */}
              {modalType === 'File' && (
  <div className="pt-4 space-y-3">
    <label className="text-[11px] uppercase font-black text-[#4fd1c5] tracking-widest">
      Upload File Content
    </label>
    
    {/* Menggunakan label sebagai pembungkus input agar seluruh area sensitif terhadap klik */}
    <label 
      htmlFor="file-upload-input"
      className="border-2 border-dashed border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center bg-[#1a1a1a]/40 hover:border-[#4fd1c5]/50 hover:bg-[#1a1a1a]/60 transition-all cursor-pointer group"
    >
      <div className="bg-[#2dcdc1]/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
        <Upload className="text-[#4fd1c5]" size={28} />
      </div>
      <p className="text-sm text-white font-medium">
        Click to select or drag and drop your files here
      </p>
      <p className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-widest">
        (Maximum Size: 5GB)
      </p>

      {/* Input file asli yang disembunyikan secara visual tapi aktif melalui label */}
      <input 
        id="file-upload-input"
        type="file" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            console.log("File terpilih:", e.target.files[0].name);
            // Anda bisa menambahkan state untuk menampilkan nama file yang terpilih di sini
          }
        }}
      />
    </label>
  </div>
)}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#1a1a1a]/80 flex justify-end items-center gap-4 border-t border-gray-800">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-gray-500 hover:text-white transition text-[11px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                className="px-10 py-3.5 bg-[#2dcdc1] hover:bg-[#25b5ab] text-[#1a1a1a] font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-xl shadow-teal-900/20 active:scale-95"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}