"use client";
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useSidebar } from "../../context/SidebarContext";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();
  const { isComputerClose, isMobileOpen } = useSidebar();
  const isDesktopExpanded = !isComputerClose && !isMobileOpen;

  return (
    <div className="w-full px-3 mb-8 transition-all duration-500">
      <button
        onClick={toggleTheme}
        className={`group relative flex items-center transition-all duration-500 overflow-hidden
          bg-white/50 dark:bg-[#F5F2F2]/5 border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 
          text-[#2B2A2A] dark:text-[#F5F2F2] shadow-sm
          hover:bg-[#5A7ACD] hover:text-white dark:hover:bg-[#FEB05D] dark:hover:text-[#2B2A2A]
          active:scale-95
          
          /* Dinamis: Full saat terbuka, Kotak saat tertutup */
          ${isDesktopExpanded 
            ? "w-full h-14 rounded-2xl px-5 justify-start gap-4" 
            : "w-12 h-12 rounded-xl justify-center mx-auto"}`}
      >
        <div className="relative w-6 h-6 flex-shrink-0">
          <Sun className="absolute inset-0 transform transition-all duration-500 scale-0 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100" size={22} />
          <Moon className="absolute inset-0 transform transition-all duration-500 scale-100 rotate-0 opacity-100 dark:scale-0 dark:-rotate-90 dark:opacity-0" size={22} />
        </div>

        {/* Label teks muncul hanya saat sidebar melebar */}
        {isDesktopExpanded && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-700">
            <span className="dark:hidden">Mode Gelap</span>
            <span className="hidden dark:block">Mode Terang</span>
          </span>
        )}
      </button>
    </div>
  );
};
