"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronsUpDown,
    Search,
    Plus,
    Play,
    Pause,
    Square,
    Sun,
    Moon,
    Menu,
    LayoutDashboard,
    Calendar,
    CircleUser,
    Briefcase,
    ClipboardList,
    Files,
    BookOpen,
    Receipt,
} from "lucide-react";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
    { icon: <LayoutDashboard size={18} />, name: "Dashboard", path: "/" },
    { icon: <Calendar size={18} />, name: "Calendar", path: "/calendar" },
    { icon: <CircleUser size={18} />, name: "Contacts", path: "/contacts" },
    { icon: <Briefcase size={18} />, name: "Matters", path: "/matters" },
    { icon: <ClipboardList size={18} />, name: "Tasks", path: "/tasks/metter" },
    { icon: <Files size={18} />, name: "Documents", path: "/documents" },
    { icon: <BookOpen size={18} />, name: "Cost Journal", path: "/cost-journal" },
    { icon: <Receipt size={18} />, name: "Transactions", path: "/transactions/invoice" },
];

const quickCreateItems = [
    { icon: <Briefcase size={16} />, name: "Matter Baru", path: "/matters" },
    { icon: <ClipboardList size={16} />, name: "Task Baru", path: "/tasks/metter" },
    { icon: <Receipt size={16} />, name: "Invoice Baru", path: "/transactions/invoice" },
];

// Hook sederhana untuk menutup dropdown saat klik di luar
function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onOutside();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onOutside]);

    return ref;
}

const AppHeader: React.FC = () => {
    const { toggleMobileSidebar } = useSidebar();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPlusOpen, setIsPlusOpen] = useState(false);
    const [query, setQuery] = useState("");

    // Stopwatch header
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const menuRef = useClickOutside<HTMLDivElement>(() => setIsMenuOpen(false));
    const plusRef = useClickOutside<HTMLDivElement>(() => setIsPlusOpen(false));

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    // Shortcut Cmd/Ctrl + K untuk fokus ke kolom pencarian
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const pad = (value: number) => value.toString().padStart(2, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const timeString = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;

    const resetTimer = () => {
        setIsRunning(false);
        setSeconds(0);
    };

    const themeButtonClass = (isActive: boolean) =>
        `flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isActive
            ? "bg-[#5A7ACD] text-white shadow-sm"
            : "text-[#2B2A2A]/50 hover:text-[#2B2A2A] dark:text-[#F5F2F2]/50 dark:hover:text-[#F5F2F2]"
        }`;

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[#2B2A2A]/10 bg-white px-3 transition-colors duration-500 dark:border-[#F5F2F2]/10 dark:bg-[#333232] md:px-6">
            <div className="mx-auto flex h-16 w-full items-center justify-between gap-2 md:gap-3">
                {/* ===== KIRI: Menu + Search + Plus + Timer ===== */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    {/* Trigger sidebar untuk mobile/iPad */}
                    <button
                        onClick={toggleMobileSidebar}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#2B2A2A] transition hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10 lg:hidden"
                        aria-label="Buka menu"
                    >
                        <Menu size={20} strokeWidth={2.5} />
                    </button>

                    {/* Menu dropdown + pencarian */}
                    <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl bg-[#F5F2F2] pl-1 pr-2 dark:bg-[#232323] md:max-w-[540px]">
                        <div className="relative hidden shrink-0 sm:block" ref={menuRef}>
                            <button
                                onClick={() => {
                                    setIsMenuOpen((prev) => !prev);
                                    setIsPlusOpen(false);
                                }}
                                className="flex h-9 items-center gap-2 rounded-lg px-3 text-[#2B2A2A] transition hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10"
                                aria-label="Buka menu navigasi"
                            >
                                <span className="hidden text-sm font-semibold sm:block">Menu</span>
                                <ChevronsUpDown size={16} className="opacity-60" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute left-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#2B2B2B]">
                                    {navItems.map((item) => {
                                        const active =
                                            pathname === item.path || pathname.startsWith(item.path + "/");
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                                                    ? "bg-[#35A99B] text-white"
                                                    : "text-[#2B2A2A] hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10"
                                                    }`}
                                            >
                                                <span className={active ? "text-white" : "text-[#35A99B]"}>
                                                    {item.icon}
                                                </span>
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <span className="mx-1 hidden h-6 w-px bg-black/10 dark:bg-white/10 sm:block" />

                        <Search size={18} className="shrink-0 text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari"
                            className="h-full w-full min-w-0 bg-transparent px-2 text-sm text-[#2B2A2A] placeholder:text-[#2B2A2A]/40 focus:outline-none dark:text-[#F5F2F2] dark:placeholder:text-[#F5F2F2]/40"
                        />
                        <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-black/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#2B2A2A]/40 dark:border-white/10 dark:text-[#F5F2F2]/40 md:flex">
                            ⌘K
                        </kbd>
                    </div>

                    {/* Tombol tambah cepat */}
                    <div className="relative hidden shrink-0 sm:block" ref={plusRef}>
                        <button
                            onClick={() => {
                                setIsPlusOpen((prev) => !prev);
                                setIsMenuOpen(false);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5A7ACD] text-white shadow-md shadow-[#35A99B]/30 transition hover:scale-105 active:scale-95"
                            aria-label="Tambah cepat"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>

                        {isPlusOpen && (
                            <div className="absolute left-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#2B2B2B]">
                                {quickCreateItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        onClick={() => setIsPlusOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#2B2A2A] transition hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10"
                                    >
                                        <span className="text-[#35A99B]">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stopwatch */}
                    <div className="hidden h-11 shrink-0 items-center gap-1 rounded-xl bg-[#F5F2F2] px-2 dark:bg-[#232323] md:flex">
                        <button
                            onClick={() => setIsRunning((prev) => !prev)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A7ACD] transition hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10"
                            aria-label={isRunning ? "Jeda timer" : "Mulai timer"}
                        >
                            {isRunning ? (
                                <Pause size={15} fill="currentColor" />
                            ) : (
                                <Play size={15} fill="currentColor" />
                            )}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A7ACD]/60 transition hover:bg-black/5 dark:text-[#F5F2F2]/60 dark:hover:bg-white/10"
                            aria-label="Stop dan reset timer"
                        >
                            <Square size={13} fill="currentColor" />
                        </button>
                        <span className="min-w-[76px] text-center font-mono text-sm font-bold tracking-widest text-[#5A7ACD] tabular-nums">
                            {timeString}
                        </span>
                    </div>
                </div>

                {/* ===== KANAN: Theme + Notifikasi ===== */}
                <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-[#F5F2F2] p-1 dark:bg-[#232323]">
                        <button
                            onClick={() => setTheme("light")}
                            className={themeButtonClass(theme === "light")}
                            aria-label="Mode terang"
                        >
                            <Sun size={18} />
                        </button>
                        <button
                            onClick={() => setTheme("dark")}
                            className={themeButtonClass(theme === "dark")}
                            aria-label="Mode gelap"
                        >
                            <Moon size={18} />
                        </button>
                    </div>

                    <NotificationDropdown />
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
