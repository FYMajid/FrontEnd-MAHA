"use client";

import { useState } from 'react';
import { Plus, LayoutGrid, Bookmark } from 'lucide-react';
import TaskModal from '@/components/tasks/TaskModal';

export default function LawOfficePage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['All', 'Urgent', 'In Progress'].map(sub => (
            <button key={sub} className="px-4 py-1.5 rounded-md text-xs font-bold transition-all border border-gray-800 text-gray-400 hover:bg-gray-800">
              {sub}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(true)} className="bg-[#287d7d] hover:bg-[#319797] text-white px-6 py-2 rounded text-xs font-bold transition-all shadow-lg">
          New Personal Task
        </button>
      </div>

      <div className="bg-[#252525] border border-gray-800 rounded-xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Bookmark className="text-gray-800 mb-4" size={50} />
        <h3 className="text-white font-semibold">Your workspace is empty</h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">Start organizing your daily law office activities here.</p>
      </div>

      <TaskModal isOpen={open} onClose={() => setOpen(false)} title="Add Personal Task" isMatterPage={false} />
    </div>
  );
}