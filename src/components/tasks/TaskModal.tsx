"use client";

import { X, ListChecks, Link as LinkIcon, User, Briefcase } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isMatterPage?: boolean;
}

export default function TaskModal({ isOpen, onClose, title, isMatterPage }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] w-full max-w-xl rounded-lg border border-gray-800 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-[#4fd1c5] font-semibold text-lg flex items-center gap-2">
            <ListChecks size={20} /> {title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-sm">
          <section className="space-y-4">
            <h3 className="text-white font-medium border-l-4 border-[#4fd1c5] pl-3">Detail Task</h3>
            
            <div className="space-y-1">
              <label className="text-[11px] text-[#4fd1c5] font-bold uppercase tracking-wider">Name Task</label>
              <input type="text" className="w-full bg-[#111] border border-[#2dcdc1]/30 rounded p-3 outline-none focus:border-[#4fd1c5] transition" placeholder="Enter task name..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400">Status</label>
                <select className="w-full bg-[#111] border border-gray-800 rounded p-2.5 outline-none focus:border-[#4fd1c5]">
                  <option>To Do</option>
                  <option>In Progress</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Priority</label>
                <select className="w-full bg-[#111] border border-gray-800 rounded p-2.5 outline-none focus:border-[#4fd1c5]">
                  <option>Normal</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Note</label>
              <textarea rows={3} className="w-full bg-[#111] border border-gray-800 rounded p-3 outline-none resize-none" placeholder="Add description..." />
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-800 pt-4">
            <h3 className="text-white font-medium">Assignment</h3>
            
            {/* Field khusus Matter Task */}
            {isMatterPage && (
              <div className="space-y-1">
                <label className="text-gray-400">Related Matter</label>
                <select className="w-full bg-[#111] border border-gray-800 rounded p-2.5 outline-none">
                  <option>Select Matter...</option>
                </select>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-gray-400">Assignee</label>
                <div className="bg-[#111] border border-gray-800 rounded p-2.5 text-gray-500 flex items-center gap-2">
                  <User size={14}/> Search users...
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-white hover:underline transition-all">Cancel</button>
          <button className="px-10 py-2.5 bg-[#2dcdc1] hover:bg-[#25b5ab] text-[#1a1a1a] font-bold rounded shadow-lg">Confirm</button>
        </div>
      </div>
    </div>
  );
}