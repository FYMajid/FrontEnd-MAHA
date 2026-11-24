"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isComputerClose, isMobileOpen } = useSidebar();
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

      {/* Main Content Area */}
      <div
        className={`flex min-h-screen min-w-0 flex-col transition-all duration-500 ease-in-out ${
          isMobileOpen ? "ml-0" : desktopMargin
        }`}
      >
        {/* Header persistent: dipasang sekali di layout, tidak remount saat pindah halaman */}
        <AppHeader />

        <main className="min-w-0 flex-1 overflow-x-clip p-4 md:px-8 md:pb-8 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
