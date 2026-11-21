"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Trash2,
  ChevronLeft,
  Calendar,
  Folder as FolderIcon,
  FileText,
} from "lucide-react";
import {
  documentService,
  DocumentItem,
  resolveDocumentFileUrl,
} from "@/services/documents";

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

export default function TrashDocumentsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [trashItems, setTrashItems] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    documentService
      .listTrash()
      .then((data) => {
        if (!isActive) return;
        setTrashItems(data);
      })
      .catch(() => {
        if (!isActive) return;
        setError("Gagal memuat trash documents.");
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredTrash = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return trashItems.filter((item) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "File" && item.type === "FILE") ||
        (activeFilter === "Folder" && item.type === "FOLDER");

      const searchable = [
        item.name,
        item.description,
        item.contact?.name,
        item.matter?.caseArea,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, trashItems]);

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-10">
          <Link
            href="/documents"
            className="p-3 bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-2xl shadow-sm text-[#2B2A2A] dark:text-[#F5F2F2] hover:bg-[#5A7ACD] hover:text-white transition-all"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-[#5A7ACD]/10 p-3 rounded-2xl text-[#5A7ACD] shadow-lg shadow-[#5A7ACD]/10">
              <Trash2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                Trash Bin
              </h1>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">
                Berkas yang Dihapus Sementara
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex flex-wrap items-center gap-6 mb-8 shadow-sm">
          <div className="relative flex-grow max-w-md group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari di tempat sampah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-transparent rounded-2xl w-full pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all"
            />
          </div>

          <div className="flex bg-[#F5F2F2] dark:bg-[#2B2A2A] p-1.5 rounded-2xl border border-[#2B2A2A]/5">
            {["All", "File", "Folder"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === filter
                    ? "bg-[#5A7ACD] text-white shadow-lg"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button className="opacity-40 hover:opacity-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-auto transition-colors">
            <Calendar size={14} /> Period
          </button>
        </div>

        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <table className="w-full text-left">
            <thead className="bg-[#F5F2F2] dark:bg-[#2B2A2A] opacity-50 text-[10px] font-black uppercase tracking-widest border-b border-[#2B2A2A]/5">
              <tr>
                <th className="px-8 py-5 w-24">Tipe</th>
                <th className="px-8 py-5">Nama Berkas</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Matter</th>
                <th className="px-8 py-5">Deskripsi</th>
                <th className="px-8 py-5 text-right">Tanggal Hapus</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold divide-y divide-[#2B2A2A]/5 dark:divide-[#F5F2F2]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-slate-400">
                    Loading trash documents...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredTrash.length > 0 ? (
                filteredTrash.map((item) => (
                  <tr key={item.id} className="hover:bg-[#5A7ACD]/5 transition-colors group">
                    <td className="px-8 py-6">
                      {item.type === "FOLDER" ? (
                        <FolderIcon size={22} className="text-[#5A7ACD]" />
                      ) : (
                        <FileText size={22} className="opacity-40" />
                      )}
                    </td>
                    <td className="px-8 py-6 font-black uppercase tracking-tight text-[#2B2A2A] dark:text-[#F5F2F2]">
                      {item.type === "FILE" && resolveDocumentFileUrl(item.fileUrl) ? (
                        <a
                          href={resolveDocumentFileUrl(item.fileUrl) ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline underline-offset-4"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="px-8 py-6 opacity-50">
                      {item.contact?.name ?? item.contactId ?? "-"}
                    </td>
                    <td className="px-8 py-6 opacity-50">
                      {item.matter?.caseArea ?? item.matterId ?? "-"}
                    </td>
                    <td className="px-8 py-6 opacity-40 italic font-medium">
                      {item.description ?? "-"}
                    </td>
                    <td className="px-8 py-6 opacity-60 font-mono text-xs text-right">
                      {formatDate(item.lastEdit)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative mb-8 group transition-transform hover:scale-105">
                        <div className="bg-[#5A7ACD]/5 dark:bg-[#F5F2F2]/5 p-12 rounded-[3rem] border-2 border-dashed border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
                          <Trash2
                            className="text-[#5A7ACD] opacity-20 group-hover:opacity-40 transition-opacity"
                            size={80}
                          />
                        </div>
                      </div>
                      <h3 className="text-[#2B2A2A] dark:text-[#F5F2F2] text-2xl font-black uppercase tracking-tighter mb-2">
                        Tempat Sampah Kosong
                      </h3>
                      <p className="text-xs font-bold opacity-40 uppercase tracking-widest max-w-xs mx-auto">
                        Tidak ada berkas yang ditemukan di folder trash.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">
            Catatan: Berkas di trash akan dihapus permanen secara otomatis setelah 30 hari.
          </p>
        </div>
      </div>
    </div>
  );
}

