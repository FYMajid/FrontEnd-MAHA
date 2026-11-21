"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isComputerClose, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsChecking(false);
  }, [router]);

  // Desktop margin mengikuti status isComputerClose
  const desktopMargin = isComputerClose ? "lg:ml-[90px]" : "lg:ml-[280px]";

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] flex items-center justify-center p-6">
        <div className="rounded-2xl border border-[#5A7ACD]/20 bg-white/70 dark:bg-black/30 px-6 py-5 text-sm font-semibold text-[#2B2A2A] dark:text-[#F5F2F2]">
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A]">
      <AppSidebar />

      {/* Trigger Mobile/iPad: Pojok kiri atas menempel layar */}
      {!isMobileOpen && (
        <button 
          onClick={toggleMobileSidebar} 
          className="lg:hidden fixed top-4 left-0 z-[40] bg-[#5A7ACD] text-white p-3 rounded-r-xl shadow-lg active:scale-95 transition-all"
        >
          <Menu size={20} strokeWidth={3} />
        </button>
      )}

      {/* Main Content Area */}
      <div className={`transition-all duration-500 ease-in-out ${isMobileOpen ? "ml-0" : desktopMargin}`}>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
