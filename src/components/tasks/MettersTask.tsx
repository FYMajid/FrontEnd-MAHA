"use client";

import { useState } from 'react';
import { Search, Clock, Calendar, LayoutGrid, Plus } from 'lucide-react';
import TaskModal from '@/components/tasks/TaskModal';

export default function MatterPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#252525] p-3 rounded-lg border border-gray-800">
        <button className="bg-[#2dcdc1] text-[#1a1a1a] px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold transition-all hover:bg-[#25b5ab]">
          <Clock size={14}/> Time Entries
        </button>
        <button className="text-gray-400 hover:text-white px-3 py-1.5 flex items-center gap-2 text-xs transition-colors">
          <Calendar size={14}/> Timesheet
        </button>
        
        <div className="h-4 w-[1px] bg-gray-700 mx-2 hidden md:block" />

        <div className="relative flex-grow max-w-xs">
          <Search className="absolute left-2.5 top-2 text-gray-500 w-3.5 h-3.5" />
          <input type="text" placeholder="Search matter task..." className="bg-[#1a1a1a] border border-gray-700 rounded w-full pl-8 pr-4 py-1.5 text-xs outline-none focus:border-[#4fd1c5]" />
        </div>

        <button 
          onClick={() => setOpen(true)}
          className="ml-auto bg-[#287d7d] hover:bg-[#319797] text-white px-5 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-[#252525] border border-gray-800 rounded-xl p-20 text-center flex flex-col items-center justify-center">
        <div className="bg-gray-800/30 p-6 rounded-full mb-4">
          <LayoutGrid size={48} className="text-gray-700" />
        </div>
        <p className="text-gray-400 font-medium italic">No matter tasks found or access restricted.</p>
      </div>

      <TaskModal isOpen={open} onClose={() => setOpen(false)} title="Add Matter Task" isMatterPage={true} />
    </div>
  );
}