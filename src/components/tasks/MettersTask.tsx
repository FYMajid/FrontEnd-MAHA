"use client";

import { useState } from 'react';
import { Search, Clock, Calendar, Plus, AlertCircle, CheckCircle, Clock3 } from 'lucide-react';
import TaskModal from '@/components/tasks/TaskModal';

interface Task {
  id: number;
  title: string;
  matter: string;
  matterId: number;
  assignee: string;
  priority: 'Normal' | 'Tinggi' | 'Urgent';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
}

export default function MatterTaskPage() {
  const [open, setOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with actual API call
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Persiapan Dokumen Gugatan',
      matter: 'Perkara Perdata A',
      matterId: 1,
      assignee: 'Aufa Hajran',
      priority: 'Tinggi',
      dueDate: '15 Apr 2026',
      status: 'To Do'
    },
    {
      id: 2,
      title: 'Review Kontrak Klien',
      matter: 'Perkara Perdata A',
      matterId: 1,
      assignee: 'Rina Wijaya',
      priority: 'Normal',
      dueDate: '18 Apr 2026',
      status: 'In Progress'
    },
    {
      id: 3,
      title: 'Koordinasi dengan Pengadilan',
      matter: 'Perkara Pidana B',
      matterId: 2,
      assignee: 'Budi Santoso',
      priority: 'Urgent',
      dueDate: '12 Apr 2026',
      status: 'In Progress'
    },
    {
      id: 4,
      title: 'Sidang Pembacaan Putusan',
      matter: 'Perkara Pidana C',
      matterId: 3,
      assignee: 'Aufa Hajran',
      priority: 'Urgent',
      dueDate: '20 Apr 2026',
      status: 'Review'
    },
    {
      id: 5,
      title: 'Pengurusan Surat Kuasa',
      matter: 'Perkara Perdata A',
      matterId: 1,
      assignee: 'Rina Wijaya',
      priority: 'Normal',
      dueDate: '10 Apr 2026',
      status: 'Done'
    }
  ]);

  const columns = ['To Do', 'In Progress', 'Review', 'Done'] as const;

  const getTasksByStatus = (status: typeof columns[number]) => {
    return tasks.filter(task => task.status === status);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.matter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent':
        return 'bg-red-500 text-white';
      case 'Tinggi':
        return 'bg-orange-500 text-white';
      case 'Normal':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'Urgent':
      case 'Tinggi':
        return <AlertCircle size={14} />;
      default:
        return <Clock3 size={14} />;
    }
  };

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] transition-colors duration-300">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 shadow-sm">
        {/* Button Time Entries */}
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
            placeholder="Cari tugas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl w-full pl-12 pr-4 py-3 text-xs font-bold text-[#2B2A2A] dark:text-[#F5F2F2] outline-none focus:border-[#5A7ACD] transition-all" 
          />
        </div>

        {/* Add Task Button */}
        <button 
          onClick={() => {
            setSelectedTaskId(null);
            setOpen(true);
          }}
          className="ml-auto bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2 transition-all shadow-lg shadow-[#5A7ACD]/20 active:scale-95"
        >
          <Plus size={16} /> Tambah Tugas
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((status) => (
          <div key={status} className="flex flex-col bg-white dark:bg-[#333232] rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 shadow-sm overflow-hidden">
            
            {/* Column Header */}
            <div className="p-6 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A]/50">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60">
                  {status}
                </h3>
                <span className="bg-[#5A7ACD] text-white text-[10px] font-black px-2 py-1 rounded-full">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-350px)] no-scrollbar">
              {tasks.filter(t => t.status === status).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className="bg-white dark:bg-[#2B2A2A] border-l-4 border-[#5A7ACD] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[#FEB05D]"
                >
                  {/* Priority Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      {task.priority}
                    </span>
                    {status === 'Done' && <CheckCircle size={14} className="text-green-500" />}
                  </div>

                  {/* Matter Name */}
                  <p className="text-[10px] font-black uppercase opacity-50 text-[#2B2A2A] dark:text-[#F5F2F2] mb-2 tracking-wider">
                    {task.matter}
                  </p>

                  {/* Task Title */}
                  <h4 className="text-sm font-black text-[#2B2A2A] dark:text-[#F5F2F2] mb-4 line-clamp-2">
                    {task.title}
                  </h4>

                  <div className="space-y-3 pt-3 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
                    {/* Assignee */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#5A7ACD] text-white text-[8px] font-black flex items-center justify-center flex-shrink-0">
                        {task.assignee[0]}
                      </div>
                      <span className="text-[10px] font-bold text-[#2B2A2A] dark:text-[#F5F2F2] opacity-70">
                        {task.assignee}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#2B2A2A] dark:text-[#F5F2F2] opacity-70">
                      <Calendar size={12} />
                      {task.dueDate}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State for Column */}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                  <div className="text-[12px] font-bold text-[#2B2A2A] dark:text-[#F5F2F2]">
                    Kosong
                  </div>
                </div>
              )}
            </div>

            {/* Column Footer - Add Task Button */}
            <div className="p-4 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
              <button 
                onClick={() => {
                  setSelectedTaskId(null);
                  setOpen(true);
                }}
                className="w-full text-[#5A7ACD] hover:text-[#FEB05D] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={12} /> Tambah
              </button>
            </div>
          </div>
        ))}
      </div>

      <TaskModal isOpen={open} onClose={() => setOpen(false)} title={selectedTaskId ? "Edit Tugas Perkara" : "Tambah Tugas Perkara"} isMatterPage={true} />
    </div>
  );
}