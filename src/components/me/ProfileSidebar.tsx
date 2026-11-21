"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Building2,
  CheckCircle,
  Layers,
  BarChart3,
  Briefcase,
  CreditCard,
  Clock,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  collapsible?: boolean;
}

interface ProfileSidebarProps {
  userName: string;
  initials: string;
  onLogout?: () => void;
}

const User = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const menuSections: MenuSection[] = [
  {
    title: "Profil",
    items: [
      {
        icon: <User size={20} />,
        label: "Aufa Hajran",
        href: "/me",
      },
      {
        icon: <Settings size={20} />,
        label: "Preferensi Akun",
        href: "/me/preferences",
      },
    ],
  },
  {
    title: "Kantor",
    items: [
      {
        icon: <Building2 size={20} />,
        label: "Profil Kantor",
        href: "/me/office-profile",
      },
      {
        icon: <CheckCircle size={20} />,
        label: "Pengesahan",
        href: "/me/verification",
      },
      {
        icon: <Layers size={20} />,
        label: "Struktural & Manajemen",
        href: "/me/structure",
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Kategori Jurnal Biaya",
        href: "/me/cost-categories",
      },
      {
        icon: <Briefcase size={20} />,
        label: "Perkara & Tugas",
        href: "/me/matters-tasks",
      },
    ],
  },
  {
    title: "Pembayaran",
    items: [
      {
        icon: <CreditCard size={20} />,
        label: "Langganan Legal Plus",
        href: "/me/subscription",
      },
      {
        icon: <Clock size={20} />,
        label: "Riwayat Pembayaran",
        href: "/me/payment-history",
      },
    ],
  },
];

export default function ProfileSidebar({
  userName,
  initials,
  onLogout,
}: ProfileSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Profil",
  ]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-full md:w-72 bg-bg-[#5A7ACD]/30 text-app-primary p-6 md:p-8 rounded-2xl md:sticky md:top-6 md:max-h-[calc(100vh-48px)] md:overflow-y-auto transition-colors duration-300">
      {/* Profile Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-[#5A7ACD] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#5A7ACD]/30">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-black leading-tight text-app-primary">{userName}</p>
            <p className="text-xs text-app-quaternary mt-1">Senior Associate</p>
          </div>
        </div>

        {/* Quick Link to Profile */}
        <Link
          href="/me"
          className={`w-full px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            isActive("/me")
              ? "bg-[#5A7ACD] text-white"
              : "bg-app-tertiary hover:bg-app-hover text-app-primary hover:text-app-primary"
          }`}
        >
          <User size={16} />
          Lihat Profil
        </Link>
      </div>

      {/* Menu Sections */}
      <div className="space-y-2">
        {menuSections.map((section, index) => (
          <div key={`${section.title}-${index}`}>
            {/* Section Title */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-3 text-xs font-black uppercase tracking-widest text-app-quaternary hover:text-app-secondary transition-colors mb-2 group"
            >
              <span>{section.title}</span>
              {expandedSections.includes(section.title) ? (
                <ChevronUp size={16} className="opacity-60" />
              ) : (
                <ChevronDown size={16} className="opacity-60" />
              )}
            </button>

            {/* Menu Items */}
            {expandedSections.includes(section.title) && (
              <div className="space-y-1 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                      isActive(item.href)
                        ? "bg-[#5A7ACD] text-white shadow-lg shadow-[#5A7ACD]/30"
                        : "text-app-secondary hover:text-app-primary hover:bg-app-tertiary dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded opacity-70 group-hover:opacity-100">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="mt-8 pt-6 border-t border-app-primary opacity-10">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
