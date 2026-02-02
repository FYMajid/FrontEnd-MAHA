"use client";
import React, { useState } from 'react';
import { 
  Users, Search, Plus, Mail, Phone, MapPin, 
  MoreVertical, Upload, X, Camera, ChevronDown 
} from 'lucide-react';

export default function ContactsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  // Contoh data berdasarkan gambar referensi
  const contacts = [
    { id: 1, name: "Celana", type: "Client", phone: "-", email: "-", address: "-" , lastEdit: "-"}, 
    { id: 2, name: "Test Person 01", type: "Client", phone: "-", email: "testperson01@gmail.com", address: "-", lastEdit: "26 November 2026"},
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-slate-100 p-6">
      {/* Header & Button Add Contact */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/20 rounded-lg text-teal-500">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-900/20"
        >
          Add Contact
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto bg-[#252525] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search contact" 
            className="w-full bg-[#1a1a1a] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>
        <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-slate-800">
          {['All', 'Client', 'Non Client'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                filter === cat ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto bg-[#252525] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a1a] text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 flex items-center gap-2">Name <ChevronDown size={14} /></th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Address</th>
                <th className="px-6 py-4 text-right">Last Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{contact.name}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-teal-500">
                      <div className="p-1 bg-teal-500/10 rounded-full"><Users size={12} /></div>
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{contact.phone}</td>
                  <td className="px-6 py-4 text-slate-400">{contact.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-right">{contact.address}</td>
                  <td className="px-6 py-4 text-slate-400 text-right">{contact.lastEdit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Modal Add Contact */}
      {isOpen && <AddContactModal onClose={() => setIsOpen(false)} />}
    </div>
  );
}

// --- KOMPONEN MODAL ADD CONTACT ---
function AddContactModal({ onClose }: { onClose: () => void }) {
  const [contactType, setContactType] = useState('Client');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-2xl border border-slate-800 flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-500">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-teal-500 tracking-tight">Add Contact</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Section: Profile Picture & Type */}
          <section className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-teal-500/30 bg-slate-800 flex items-center justify-center overflow-hidden">
                <Users size={64} className="text-teal-500/50" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-teal-600 rounded-full text-white shadow-lg border-2 border-[#1e1e1e] hover:bg-teal-500 transition-all">
                <Camera size={16} />
              </button>
            </div>
            <button className="bg-teal-600 hover:bg-teal-500 px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
              <Upload size={14} /> Upload Picture
            </button>

            <div className="w-full space-y-4">
              <div className="flex bg-[#252525] p-1 rounded-lg border border-slate-800 w-fit">
                {['Client', 'Non Client'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setContactType(type)}
                    className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${
                      contactType === type ? 'bg-teal-500 text-white shadow-lg shadow-teal-900/20' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-100 uppercase tracking-wider text-[10px]">Contact Type</label>
                <div className="relative">
                  <select className="w-full bg-[#252525] border border-slate-800 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:ring-1 focus:ring-teal-500">
                    <option>Entity Type</option>
                    <option>Individual</option>
                    <option>Company</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Contact Information */}
          <section className="space-y-6 pt-6 border-t border-slate-800">
            <h3 className="font-bold text-lg text-slate-100">Contact Information</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-800 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-300">
                <Plus size={16} className="text-teal-500" /> Add Email
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-800 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-300">
                <Plus size={16} className="text-teal-500" /> Add Phone Number
              </button>
            </div>
          </section>

          {/* Section: Address Detail */}
          <section className="space-y-6 pt-6 border-t border-slate-800">
            <h3 className="font-bold text-lg text-slate-100">Address Detail</h3>
            <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-800 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-300">
              <Plus size={16} className="text-teal-500" /> Add Address
            </button>
          </section>

          {/* Section: Additional Information */}
          <section className="space-y-6 pt-6 border-t border-slate-800">
            <h3 className="font-bold text-lg text-slate-100">Additional Information</h3>
            <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-800 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-300">
              <Plus size={16} className="text-teal-500" /> Add Additional Information
            </button>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-[#1e1e1e] flex justify-end items-center gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button className="bg-teal-600 hover:bg-teal-500 px-8 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}