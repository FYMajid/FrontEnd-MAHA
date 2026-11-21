"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  Briefcase,
  ClipboardList,
  Files,
  BookOpen,
  Receipt,
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleUser,
} from "lucide-react";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

// Data Dummy User (Ganti dengan data dari auth/session Anda)
const userData = {
  fullName: "Alex Johanes",
  email: "alex.j@legalplus.com",
  initials: "AJ"
};

const navItems = [
  { icon: <LayoutDashboard size={22} />, name: "Dashboard", path: "/" },
  { icon: <Calendar size={22} />, name: "Calendar", path: "/calendar" },
  { icon: <CircleUser size={22} />, name: "Contacts", path: "/contacts" },
  { icon: <Briefcase size={22} />, name: "Matters", path: "/matters" },
  { icon: <ClipboardList size={22} />, name: "Tasks", path: "/tasks/metter" },
  { icon: <Files size={22} />, name: "Documents", path: "/documents" },
  { icon: <BookOpen size={22} />, name: "Cost Journal", path: "/cost-journal" },
  { icon: <Receipt size={22} />, name: "Transactions", path: "/transactions/invoice" },
];

const AppSidebar: React.FC = () => {
  const { isComputerClose, isMobileOpen, toggleComputerSidebar, toggleMobileSidebar } = useSidebar();
  const { theme } = useTheme();
  const pathname = usePathname();

  const logoSrc =
    theme === "dark" ? "/images/white_logo.png" : "/images/black_logo.png";

  const isDesktopExpanded = !isComputerClose && !isMobileOpen;
  const logoSize = isDesktopExpanded ? 64 : 48;

  return (
    <>
      {/* Overlay Mobile: Layar gelap saat sidebar buka di HP/iPad */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-[45] bg-[#2B2A2A]/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen transition-all duration-500 ease-in-out z-50 border-r
          bg-[#F5F2F2] dark:bg-[#2B2A2A] border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10
          /* Lebar tetap 90px saat isMobileOpen (HP) atau isComputerClose (PC) */
          ${isComputerClose || isMobileOpen ? "w-[90px]" : "w-[280px]"}
          /* Mobile: Drawer translate, PC: Selalu muncul */
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Tombol Toggle PC di perbatasan */}
        <button 
          onClick={toggleComputerSidebar}
          className="hidden lg:flex absolute -right-4 top-10 items-center justify-center w-8 h-8 rounded-full 
            bg-[#5A7ACD] text-white shadow-lg z-[60] border-4 border-[#F5F2F2] dark:border-[#2B2A2A]"
        >
          {isComputerClose ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        <div className="flex flex-col h-full items-center">
          {/* Logo Section */}
          <div className="flex w-full items-center justify-center py-6">
            <Link href="/" className="inline-flex items-center justify-center">
              <Image
                src={logoSrc}
                alt="Logo"
                width={logoSize}
                height={logoSize}
                priority
              />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-grow px-2 mt-4 space-y-4">
            <ul className="flex flex-col gap-2">
              {navItems.map((nav) => {
                const active = pathname === nav.path || pathname.startsWith(nav.path + "/");
                return (
                  <li key={nav.name} className="relative group/item">
                    <Link
                      href={nav.path}
                      onClick={() => isMobileOpen && toggleMobileSidebar()}
                      className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300
                        ${active 
                          ? "bg-[#5A7ACD] text-white shadow-lg shadow-[#5A7ACD]/20" 
                          : "text-[#2B2A2A] dark:text-[#F5F2F2] opacity-60 hover:opacity-100 hover:bg-[#FEB05D] dark:hover:text-[#2B2A2A]"}
                        /* Jika Melebar (Expanded), padding kiri disesuaikan */
                        ${isDesktopExpanded ? "lg:justify-start lg:w-[240px] lg:px-4" : "w-12 h-12"}`}
                    >
                      <span className="flex-shrink-0">{nav.icon}</span>
                      
                      {/* Teks hanya muncul di PC saat isComputerClose FALSE */}
                      {isDesktopExpanded && (
                        <span className="hidden lg:block text-sm font-bold tracking-tight ml-3 animate-in fade-in duration-300">
                          {nav.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav> 

          {/* User Profile Section */}
          <div className="mt-auto w-full border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
            <div className="w-full px-3 py-4">
              <Link
                href="/me"
                className={`flex w-full items-center gap-3 transition-all duration-300 group ${
                  isDesktopExpanded
                    ? "bg-white/60 dark:bg-white/5 p-3 rounded-2xl hover:bg-[#FEB05D]/10"
                    : "justify-center"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5A7ACD] text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                  {userData.initials}
                </div>

                {isDesktopExpanded && (
                  <div className="text-left overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                    <p className="text-sm font-extrabold text-[#2B2A2A] dark:text-[#F5F2F2] truncate">
                      {userData.fullName}
                    </p>
                    <p className="text-xs text-[#2B2A2A]/50 dark:text-[#F5F2F2]/50 truncate font-medium">
                      {userData.email}
                    </p>
                  </div>
                )}
              </Link>
            </div>

            <ThemeToggleButton />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
