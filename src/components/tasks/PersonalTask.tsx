"use client";

import { useState } from 'react';
import { Plus, Search, Clock, Calendar, ChevronDown, ArrowUpDown } from 'lucide-react';
import TaskModal from '@/components/tasks/TaskModal';

interface Task {
  id: number;
  name: string;
  duration: string;
  reference?: string;
  file?: string;
  creator: string;
  status: 'Berlangssung' | 'Selesai' | 'To Do';
  priority: 'Normal' | 'Tinggi' | 'Urgent';
  dateRange: string;
  modifiedDate: string;
}

export default function PersonalTaskPage() {
  const [open, setOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Sample data - replace with actual API call
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      name: 'tes',
      duration: '14h',
      reference: '-',
      file: '-',
      creator: 'User',
      status: 'Berlangssung',
      priority: 'Tinggi',
      dateRange: '11 Apr - 25 Apr 2026',
      modifiedDate: '11 Apr 2026'
    }
  ]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Berlangssung':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'Selesai':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'To Do':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Tinggi':
        return 'bg-red-500 text-white';
      case 'Urgent':
        return 'bg-red-600 text-white';
      case 'Normal':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] transition-colors duration-300">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 shadow-sm">
        {/* Button Time Entries - Active */}
        <button className="bg-[#5A7ACD] text-[#F5F2F2] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:bg-[#FEB05D] hover:text-[#2B2A2A]">
          <Clock size={14}/> Time Entries
        </button>
        
        {/* Button Timesheet */}
        <button className="text-[#2B2A2A] dark:text-[#F5F2F2] opacity-50 hover:opacity-100 px-3 py-1.5 flex items-center gap-2 text-xs font-bold transition-opacity">
          <Calendar size={14}/> Timesheet
        </button>
        
        <div className="h-6 w-[1px] bg-[#2B2A2A]/10 dark:bg-[#F5F2F2]/10 mx-2 hidden md:block" />

        {/* Search Input */}
        <div className="relative flex-grow max-w-xs group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2A2A] dark:text-[#F5F2F2] opacity-30 group-focus-within:text-[#5A7ACD] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cari tugas" 
            className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl w-full pl-12 pr-4 py-3 text-xs font-bold text-[#2B2A2A] dark:text-[#F5F2F2] outline-none focus:border-[#5A7ACD] transition-all" 
          />
        </div>

        {/* Filter Dropdowns */}
        <select className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl px-3 py-2 text-xs font-bold text-[#2B2A2A] dark:text-[#F5F2F2] outline-none cursor-pointer hover:border-[#5A7ACD]">
          <option>Status</option>
          <option>Berlangssung</option>
          <option>Selesai</option>
          <option>To Do</option>
        </select>

        <select className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl px-3 py-2 text-xs font-bold text-[#2B2A2A] dark:text-[#F5F2F2] outline-none cursor-pointer hover:border-[#5A7ACD]">
          <option>Prioritas</option>
          <option>Normal</option>
          <option>Tinggi</option>
          <option>Urgent</option>
        </select>

        {/* Add Task Button */}
        <button 
          onClick={() => setOpen(true)}
          className="ml-auto bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2 transition-all shadow-lg shadow-[#5A7ACD]/20 active:scale-95"
        >
          <Plus size={16} /> Tambah Tugas
        </button>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-[#333232] rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)] no-scrollbar">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A]/50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">Waktu</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">Tautan</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">File</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">Akun Pembuat</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    Prioritas
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">Linimasa</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 whitespace-nowrap">Tanggal Diubah</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr 
                  key={task.id}
                  className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 hover:bg-[#F5F2F2] dark:hover:bg-[#2B2A2A]/50 transition-colors cursor-pointer"
                  onClick={() => toggleRow(task.id)}
                >
                  <td className="px-6 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] font-bold text-xs flex items-center gap-1 whitespace-nowrap">
                    <Clock size={14} className="text-[#5A7ACD]" /> {task.duration}
                  </td>
                  <td className="px-6 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] opacity-50 font-bold whitespace-nowrap">{task.reference}</td>
                  <td className="px-6 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] opacity-50 font-bold whitespace-nowrap">{task.file}</td>
                  <td className="px-6 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] opacity-50 font-bold flex items-center gap-2 whitespace-nowrap">
                    <div className="w-6 h-6 rounded-full bg-[#5A7ACD] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                      U
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] opacity-50 font-bold whitespace-nowrap">
                    {task.dateRange}
                  </td>
                  <td className="px-6 py-4 text-[#2B2A2A] dark:text-[#F5F2F2] opacity-50 font-bold whitespace-nowrap">
                    {task.modifiedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Add Row */}
        <div className="border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 px-6 py-4">
          <button 
            onClick={() => setOpen(true)}
            className="text-[#5A7ACD] hover:text-[#FEB05D] font-black text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Tambah Tugas
          </button>
        </div>
      </div>

      <TaskModal isOpen={open} onClose={() => setOpen(false)} title="Tambah Tugas" isMatterPage={false} />
    </div>
  );
}