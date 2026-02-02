'use client';
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Gavel, 
  CheckSquare, 
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowUpRight
} from 'lucide-react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPart = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-6xl font-black tracking-tighter text-slate-800 dark:text-white">
          {formatPart(time.getHours())}:{formatPart(time.getMinutes())}
        </span>
        <span className="text-2xl font-bold text-teal-500 w-[40px]">
          {formatPart(time.getSeconds())}
        </span>
      </div>
      <div className="mt-2 px-4 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </div>
  );
};

// Komponen Card Kecil (Statistik)
const StatCard = ({ title, value, amount, colorClass }: any) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <div className="flex justify-between items-end mt-2">
      <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
      <span className={`text-sm font-medium ${colorClass}`}>{amount}</span>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-300">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-teal-500" />
            Papan Informasi Personal
          </h1>
          <p className="text-slate-500">Selamat datang kembali, <span className="font-semibold text-teal-600">Aufa Hajran</span></p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">AH</div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold leading-none">Aufa Hajran</p>
            <p className="text-[10px] text-slate-400">Senior Associate</p>
          </div>
        </div>
      </header>

      {/* Main Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri & Tengah (8 Kolom) */}
        <div className="lg:col-span-8 space-y-6">
          
         {/* JAM & HIGHLIGHTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <Clock size={20} className="text-slate-200 dark:text-slate-700" />
                  </div>
                  <DigitalClock />
                </div>

                <div className="bg-teal-600 dark:bg-teal-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <FileText size={200} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Agenda Sidang</h3>
                  <p className="text-teal-100 mb-6">Hari ini jadwal Anda kosong. Gunakan waktu untuk meninjau berkas tertunda.</p>
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2">
                    Buka Kalender <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

          {/* Row 2: Invoices & Perkara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h3 className="font-bold flex items-center gap-2"><FileText size={20}/> Ringkasan Invoice</h3>
               <div className="grid grid-cols-1 gap-3">
                  <StatCard title="Draft" value="0" amount="Rp 0,00" colorClass="text-slate-500" />
                  <StatCard title="Belum Dibayar" value="12" amount="Rp 4.500.000" colorClass="text-red-500" />
                  <StatCard title="Sudah Dibayar" value="8" amount="Rp 12.000.000" colorClass="text-green-500" />
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold flex items-center gap-2"><Gavel size={20}/> Perkara Aktif</h3>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs rounded-full font-bold">Berjalan</span>
              </div>
              <div className="border-l-4 border-teal-500 pl-4 space-y-2">
                <p className="text-xs text-slate-400">#25110002</p>
                <p className="font-bold">Test Person 01</p>
                <p className="text-sm text-slate-500">Pidana Lalu Lintas</p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Sisa Tagihan</p>
                  <p className="font-bold text-orange-500">Rp 1.250.000</p>
                </div>
                <button className="text-teal-500 text-sm font-semibold hover:underline">Detail Perkara</button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (4 Kolom) - Sidebar widgets */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Placeholder untuk Kalender Library */}
              <div className="text-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <CalendarIcon className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400 italic">Widget Kalender Interaktif</p>
              </div>
           </div>

           <div className="bg-teal-900 text-white p-6 rounded-2xl">
              <h4 className="font-bold mb-4">Informasi Akun</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-60">Status</span>
                  <span className="font-medium text-teal-300">Mahasiswa Hukum</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Tipe Akun</span>
                  <span className="font-medium">Advance</span>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-all">
                Pengaturan Profil
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}