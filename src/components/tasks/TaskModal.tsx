"use client";

import { X, ListChecks, Calendar, AlertCircle, Paperclip } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isMatterPage?: boolean;
}

export default function TaskModal({ isOpen, onClose, title, isMatterPage }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#2B2A2A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] w-full max-w-2xl rounded-[2.5rem] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-8 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex items-center justify-between bg-white dark:bg-[#333232]">
          <div className="flex items-center gap-3">
            <div className="text-[#2B2A2A] dark:text-[#F5F2F2]">
              <ListChecks size={20} strokeWidth={3} />
            </div>
            <h2 className="text-[#2B2A2A] dark:text-[#F5F2F2] font-black text-lg uppercase tracking-tighter">
              {title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 text-[#2B2A2A] dark:text-[#F5F2F2] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar text-[#2B2A2A] dark:text-[#F5F2F2]">
          
          {/* Section: Detail Task */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
              Detail Tugas
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-1">Judul Tugas</label>
              <input 
                type="text" 
                className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD] focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all" 
                placeholder={isMatterPage ? "Contoh: Persiapan Dokumen Gugatan..." : "Masukkan nama tugas..."} 
              />
            </div>

            {isMatterPage && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-1">Tipe Tugas</label>
                <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#5A7ACD]">
                  <option>Research & Analysis</option>
                  <option>Document Preparation</option>
                  <option>Court Appearance</option>
                  <option>Client Meeting</option>
                  <option>Filing & Submission</option>
                  <option>Follow-up</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-1">Status</label>
                <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#5A7ACD]">
                  {isMatterPage ? (
                    <>
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Review</option>
                      <option>Done</option>
                    </>
                  ) : (
                    <>
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-1">Prioritas</label>
                <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#5A7ACD]">
                  <option>Normal</option>
                  <option>Tinggi</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-1">Tanggal Mulai - Tanggal Selesai</label>
              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 flex items-center gap-2 font-bold">
                <input 
                  type="date" 
                  className="flex-1 bg-transparent text-sm font-bold outline-none text-[#2B2A2A] dark:text-[#F5F2F2]"
                />
                <span className="text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40 px-2">-</span>
                <input 
                  type="date" 
                  className="flex-1 bg-transparent text-sm font-bold outline-none text-[#2B2A2A] dark:text-[#F5F2F2]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-1">Deskripsi & Catatan</label>
              <textarea 
                rows={3} 
                className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none resize-none focus:border-[#5A7ACD] transition-all" 
                placeholder={isMatterPage ? "Tambahkan detail tugas perkara..." : "Tambahkan catatan..."} 
              />
            </div>
          </section>

          {/* Section: Assignment & Details */}
          <section className="space-y-6 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 pt-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
              {isMatterPage ? "Detail Penugasan Perkara" : "Penugasan"}
            </h3>

            <div className="space-y-4">
              {isMatterPage && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-1">Perkara Terkait</label>
                  <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#5A7ACD]">
                    <option>Perkara Perdata A - PT Jakarta</option>
                    <option>Perkara Pidana B - PN Bandung</option>
                    <option>Perkara Pidana C - PN Jakarta</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-1">Penanggung Jawab (PJ)</label>
                <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#5A7ACD]">
                  <option>Aufa Hajran</option>
                  <option>Rina Wijaya</option>
                  <option>Budi Santoso</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-1">Tim Pendukung</label>
                <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-[#5A7ACD]">
                  <option>Rina Wijaya, Budi Santoso</option>
                  <option>Aufa Hajran</option>
                  <option>Multiple Members</option>
                </select>
              </div>

              {isMatterPage && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-1 flex items-center gap-2">
                    <AlertCircle size={12} /> Urgensi Khusus
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#5A7ACD]" />
                      <span className="text-[10px] font-bold">Deadline Ketat (Court Date)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#5A7ACD]" />
                      <span className="text-[10px] font-bold">Memerlukan Persetujuan Klien</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#5A7ACD]" />
                      <span className="text-[10px] font-bold">Konfidensial</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>

          {isMatterPage && (
            <section className="space-y-6 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 pt-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                <Paperclip size={12} /> Lampiran Dokumen
              </h3>
              <div className="border-2 border-dashed border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-2xl p-6 text-center cursor-pointer hover:border-[#5A7ACD] transition-all">
                <p className="text-[10px] font-bold text-[#2B2A2A]/50 dark:text-[#F5F2F2]/50">
                  Seret file atau klik untuk mengupload dokumen
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex flex-col sm:flex-row justify-end gap-4 bg-white dark:bg-[#333232]">
          <button 
            onClick={onClose} 
            className="px-8 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all text-center"
          >
            Batal
          </button>
          <button className="px-12 py-4 bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#5A7ACD]/20 transition-all active:scale-95 text-center">
            Simpan Tugas
          </button>
        </div>
      </div>
    </div>
  );
}