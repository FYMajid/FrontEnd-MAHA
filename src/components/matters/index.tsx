"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Scale, MoreVertical } from "lucide-react";
import Link from "next/link";
import { matterService, MatterItem, MatterStatus } from "@/services/matters";
import { contactService, Contact } from "@/services/contacts";
import { userService } from "@/services/user";
import type { AuthUser } from "@/services/auth";
import AddMatterModal from "./AddMatterModal";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatusLabel = (status: MatterStatus) => {
  if (status === "DONE") return "Done";
  if (status === "IN_PROGRESS") return "In Progress";
  return "Pending";
};

export default function ResponsiveMattersManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    matterService
      .list()
      .then((data) => {
        if (isActive) {
          setMatters(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setError("Gagal memuat matters. Coba lagi.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    Promise.allSettled([contactService.list(), userService.getMe()]).then(
      (results) => {
        if (!isActive) return;
        const [contactsResult, userResult] = results;

        if (contactsResult.status === "fulfilled") {
          setContacts(contactsResult.value);
        }

        if (userResult.status === "fulfilled") {
          setCurrentUser(userResult.value.user);
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, []);

  const handleMatterCreated = (newMatter: MatterItem) => {
    setMatters((prev) => [newMatter, ...prev]);
  };

  const filteredMatters = useMemo(() => {
    const query = search.trim().toLowerCase();
    const statusFilter =
      activeFilter === "All"
        ? null
        : activeFilter === "Done"
          ? "DONE"
          : activeFilter === "In Progress"
            ? "IN_PROGRESS"
            : activeFilter === "Pending"
              ? "PENDING"
              : "ARCHIVED";

    return matters.filter((matter) => {
      if (statusFilter === "ARCHIVED") return false;
      const matchesStatus = !statusFilter || matter.status === statusFilter;
      const searchable = [
        matter.caseArea,
        matter.caseType,
        matter.disputeResolution,
        matter.client?.name,
        matter.responsibleAttorney?.firstName,
        matter.responsibleAttorney?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, matters, search]);

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-6 transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-[#2B2A2A] dark:text-[#F5F2F2]">
              Matter Management
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5A7ACD]">
              MAHA Legal Tech System
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-8 py-3.5 rounded-2xl flex justify-center items-center gap-3 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-[#5A7ACD]/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} aria-hidden="true" /> Add New Matter
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-xl group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors"
              size={18}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search by case title, client, or attorney..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-[#2B2A2A] dark:text-[#F5F2F2] placeholder-[#2B2A2A]/30 dark:placeholder-[#F5F2F2]/30 outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {["All", "Pending", "In Progress", "Done", "Archived"].map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                    activeFilter === filter
                      ? "bg-[#2B2A2A] text-[#F5F2F2] dark:bg-[#F5F2F2] dark:text-[#2B2A2A] border-transparent shadow-md"
                      : "bg-white dark:bg-[#333232] text-[#2B2A2A]/60 dark:text-[#F5F2F2]/60 border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 hover:border-[#5A7ACD]"
                  }`}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[2rem] shadow-xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#5A7ACD]/30 scrollbar-track-transparent">
            <table className="w-full text-left text-sm min-w-[960px] border-collapse">
              <thead className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
                <tr>
                  {["Case Title", "Client", "Attorney", "Start Date"].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40">
                      {h}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40">Dispute</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40 text-right">Updated</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A2A]/5 dark:divide-[#F5F2F2]/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center gap-3 text-sm font-bold text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40 uppercase tracking-widest animate-pulse">
                        <Scale size={18} aria-hidden="true" /> Loading matters...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-red-500 font-semibold text-sm">
                      {error}
                    </td>
                  </tr>
                ) : filteredMatters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-[#5A7ACD]/8 dark:bg-[#5A7ACD]/12 p-5 rounded-2xl">
                          <Scale size={32} className="text-[#5A7ACD]/60" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-semibold text-[#2B2A2A]/50 dark:text-[#F5F2F2]/50">
                          {search || activeFilter !== "All" ? "Tidak ada hasil yang cocok" : "Belum ada perkara"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMatters.map((matter, index) => {
                    const clientName = matter.client?.name ?? "—";
                    const attorneyName =
                      [
                        matter.responsibleAttorney?.firstName,
                        matter.responsibleAttorney?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "—";
                    const title = `${matter.caseArea} — ${matter.caseType}`;

                    return (
                      <tr
                        key={matter.id}
                        className="hover:bg-[#5A7ACD]/4 dark:hover:bg-[#5A7ACD]/8 transition-colors group"
                      >
                        <td className="px-6 py-4 w-[280px]">
                          <Link href={`/matters/${matter.id}`} className="block group/link">
                            <div className="font-semibold text-[#2B2A2A] dark:text-[#F5F2F2] group-hover/link:text-[#5A7ACD] transition-colors leading-snug mb-0.5">
                              {title}
                            </div>
                            <div className="text-[10px] font-bold text-[#2B2A2A]/30 dark:text-[#F5F2F2]/30 tabular-nums">
                              #{String(index + 1).padStart(3, "0")}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          {matter.clientId ? (
                            <Link
                              href={`/contacts/${matter.clientId}`}
                              className="font-semibold text-[#2B2A2A] dark:text-[#F5F2F2] hover:text-[#5A7ACD] dark:hover:text-[#5A7ACD] transition-colors"
                            >
                              {clientName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-[#2B2A2A]/60 dark:text-[#F5F2F2]/60">{clientName}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#2B2A2A] dark:text-[#F5F2F2]">
                          {attorneyName}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#2B2A2A]/60 dark:text-[#F5F2F2]/60">
                          {formatDate(matter.startDate)}
                        </td>
                        <td className=" py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              matter.status === "DONE"
                                ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                                : matter.status === "IN_PROGRESS"
                                  ? "bg-[#5A7ACD]/10 text-[#5A7ACD] border-[#5A7ACD]/20"
                                  : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                            }`}
                          >
                            {formatStatusLabel(matter.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-[#2B2A2A]/5 dark:bg-[#F5F2F2]/5 rounded-md text-[10px] font-semibold text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 uppercase tracking-wide">
                            {matter.disputeResolution}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-[#2B2A2A]/50 dark:text-[#F5F2F2]/50 tabular-nums">
                          {formatDate(matter.updatedAt ?? matter.createdAt ?? null)}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            className="p-1.5 opacity-40 hover:opacity-100 hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all cursor-pointer"
                            aria-label="Aksi baris perkara"
                          >
                            <MoreVertical size={15} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Matter */}
      <AddMatterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleMatterCreated}
        initialContacts={contacts}
        initialCurrentUser={currentUser}
      />
    </div>
  );
}
