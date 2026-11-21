'use client';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Gavel, 
  Calendar as CalendarIcon,
  Clock,
  ArrowUpRight,
  User,
  CreditCard
} from 'lucide-react';

const DigitalClock = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);

    const update = () => setTime(new Date());
    update();

    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || !time) return null;

  const formatPart = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-6xl font-black tracking-tighter text-[#2B2A2A] dark:text-[#F5F2F2]">
          {formatPart(time.getHours())}:{formatPart(time.getMinutes())}
        </span>
        <span className="text-2xl font-bold text-[#5A7ACD] w-[40px]">
          {formatPart(time.getSeconds())}
        </span>
      </div>

      <div className="mt-4 px-6 py-2 bg-[#2B2A2A]/5 dark:bg-[#F5F2F2]/10 rounded-full border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">
          {time.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

// Komponen Card Statistik dengan penyesuaian warna
const StatCard = ({ title, value, amount, colorClass }: any) => (
  <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] p-5 rounded-2xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 shadow-sm hover:shadow-md transition-all">
    <p className="text-xs font-bold uppercase tracking-wider opacity-60 text-[#2B2A2A] dark:text-[#F5F2F2]">{title}</p>
    <div className="flex justify-between items-end mt-3">
      <h3 className="text-3xl font-black text-[#2B2A2A] dark:text-[#F5F2F2]">{value}</h3>
      <span className={`text-sm font-bold p-1 px-2 rounded-lg bg-white/50 dark:bg-black/20 ${colorClass}`}>{amount}</span>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#5A7ACD] rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Papan Informasi Personal</h1>
          </div>
          <p className="opacity-70 text-lg">Selamat datang kembali, <span className="font-bold border-b-2 border-[#5A7ACD]">Aufa Hajran</span></p>
        </div>

        <div className="flex items-center gap-4 p-2 pr-6 bg-white dark:bg-[#2B2A2A] rounded-2xl shadow-sm border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
          <div className="w-12 h-12 bg-[#5A7ACD] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#5A7ACD]/30">
            AH
          </div>
          <div>
            <p className="text-sm font-black leading-none">Aufa Hajran</p>
            <p className="text-[11px] font-bold opacity-50 uppercase mt-1 tracking-wider">Senior Associate</p>
          </div>
        </div>
      </header>

      {/* Main Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri & Tengah (8 Kolom) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Row 1: JAM & HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clock Widget */}
            <div className="bg-white dark:bg-[#2B2A2A] rounded-[2.5rem] p-8 border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5 shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-6 right-6">
                <Clock size={20} className="opacity-20" />
              </div>
              <DigitalClock />
            </div>

            {/* Agenda Card */}
            <div className="bg-white dark:bg-[#333232] rounded-[2.5rem] p-8 border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5 shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700 text-[#2B2A2A] dark:text-[#F5F2F2]">
                <Gavel size={240} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-3">Agenda Sidang</h3>
                <p className="opacity-70 mb-8 leading-relaxed">Hari ini jadwal Anda kosong. Gunakan waktu untuk meninjau berkas atau riset hukum tertunda.</p>
                <button className="bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-8 py-4 rounded-2xl text-sm font-black transition-all duration-300 flex items-center gap-3 shadow-lg shadow-[#5A7ACD]/20 hover:shadow-[#FEB05D]/40 active:scale-95">
                  BUKA KALENDER <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Invoices & Perkara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Invoice Summary */}
            <div className="space-y-4">
              <h3 className="font-black text-xl flex items-center gap-2 uppercase tracking-tight">
                <CreditCard size={22} className="text-[#5A7ACD]"/> Ringkasan Invoice
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <StatCard title="Draft" value="0" amount="Rp 0" colorClass="text-slate-400" />
                <StatCard title="Belum Dibayar" value="12" amount="Rp 4.500.000" colorClass="text-red-500" />
                <StatCard title="Sudah Dibayar" value="8" amount="Rp 12.000.000" colorClass="text-emerald-500" />
              </div>
            </div>

            {/* Active Case */}
            <div className="space-y-4">
              <h3 className="font-black text-xl flex items-center gap-2 uppercase tracking-tight">
                <Gavel size={22} className="text-[#5A7ACD]"/> Perkara Aktif
              </h3>
              <div className="bg-white dark:bg-[#333232] p-8 rounded-[2.5rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5 shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none h-full relative">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-[#5A7ACD]/10 text-[#5A7ACD] text-[10px] rounded-full font-black uppercase tracking-widest border border-[#5A7ACD]/20">
                    Berjalan
                  </span>
                  <p className="text-[10px] font-bold opacity-40">CASE ID: #25110002</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-2xl font-black">Test Person 01</h4>
                  <p className="text-[#5A7ACD] font-bold">Pidana Lalu Lintas</p>
                  <div className="pt-4 flex flex-col gap-1">
                     <p className="text-[10px] uppercase font-black opacity-40">Sisa Tagihan</p>
                     <p className="text-2xl font-black text-[#FEB05D]">Rp 1.250.000</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5">
                  <button className="text-[#5A7ACD] dark:text-[#5A7ACD] text-sm font-black hover:tracking-widest transition-all duration-300 uppercase">
                    Detail Perkara →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (4 Kolom) - Sidebar widgets */}
        <div className="lg:col-span-4 space-y-8">
           {/* Calendar Widget */}
           <div className="bg-white dark:bg-[#333232] p-8 rounded-[2.5rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5 shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none">
              <h3 className="font-black mb-6 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#5A7ACD]"/> Jadwal Bulanan
              </h3>
              <div className="aspect-square w-full border-2 border-dashed border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                <CalendarIcon className="mb-4 opacity-20" size={48} />
                <p className="text-sm font-bold opacity-40 italic">Widget Kalender Interaktif akan dimuat di sini</p>
              </div>
           </div>

           {/* Account Info */}
           <div className="bg-[#2B2A2A] dark:bg-[#F5F2F2] text-[#F5F2F2] dark:text-[#2B2A2A] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <User size={80} />
              </div>
              <h4 className="font-black text-xl mb-6 uppercase tracking-tighter">Informasi Akun</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 dark:border-black/10 pb-2">
                  <span className="text-xs font-bold uppercase opacity-60">Status</span>
                  <span className="font-black text-[#5A7ACD]">Mahasiswa Hukum</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 dark:border-black/10 pb-2">
                  <span className="text-xs font-bold uppercase opacity-60">Tipe Akun</span>
                  <span className="font-black uppercase tracking-widest">Advance</span>
                </div>
              </div>
              <button className="w-full mt-10 py-4 bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] font-black rounded-2xl transition-all duration-300 shadow-lg shadow-black/20">
                PENGATURAN PROFIL
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}