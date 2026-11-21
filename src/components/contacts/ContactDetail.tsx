"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  UserCircle2,
  ChevronDown,
  Briefcase,
  ClipboardList,
  FolderOpen,
  User,
  Plus,
  Search,
  Folder,
  FileText,
} from "lucide-react";
import { contactService, Contact } from "@/services/contacts";
import {
  documentService,
  DocumentItem,
  resolveDocumentFileUrl,
} from "@/services/documents";
import { matterService, MatterItem } from "@/services/matters";

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

const displayValue = (value?: string | null) => (value ? value : "-");

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="grid grid-cols-[140px_14px_1fr] items-start gap-2 text-sm">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/50">
      {label}
    </span>
    <span className="text-slate-300 dark:text-white/20">:</span>
    <span className="text-[#2B2A2A] dark:text-white/90 font-semibold">
      {displayValue(value)}
    </span>
  </div>
);

export default function ContactDetail() {
  const params = useParams();
  const contactId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "portals"
  >("overview");
  const [contact, setContact] = useState<Contact | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docFilter, setDocFilter] = useState<"All" | "File" | "Folder">("All");
  const [docSearch, setDocSearch] = useState("");

  useEffect(() => {
    if (!contactId) return;

    let isActive = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      contactService.getById(String(contactId)),
      documentService.listAll(),
      matterService.list(),
    ])
      .then(([contactData, documentData, matterData]) => {
        if (!isActive) return;
        setContact(contactData);
        setDocuments(documentData);
        setMatters(matterData);
      })
      .catch(() => {
        if (isActive) {
          setError("Gagal memuat detail kontak.");
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
  }, [contactId]);

  const contactDocuments = useMemo(() => {
    if (!contact) return [];
    return documents.filter(
      (doc) => doc.contactId === contact.id && !doc.isDeleted,
    );
  }, [contact, documents]);

  const filteredDocuments = useMemo(() => {
    const query = docSearch.trim().toLowerCase();
    return contactDocuments.filter((doc) => {
      const matchesFilter =
        docFilter === "All" ||
        (docFilter === "File" && doc.type === "FILE") ||
        (docFilter === "Folder" && doc.type === "FOLDER");

      const searchable = [doc.name, doc.hyperlink, doc.physicalLocation]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [contactDocuments, docFilter, docSearch]);

  const contactMatters = useMemo(() => {
    if (!contact) return [];
    return matters.filter((matter) => matter.clientId === contact.id);
  }, [contact, matters]);

  const primaryLabel = contact?.contactType ?? "Contact";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] p-6 text-[#2B2A2A] dark:text-[#F5F2F2]">
        <div className="max-w-7xl mx-auto text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] p-6 text-[#2B2A2A] dark:text-[#F5F2F2]">
        <div className="max-w-7xl mx-auto text-sm text-red-500">
          {error ?? "Contact not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] p-6 text-[#2B2A2A] dark:text-[#F5F2F2] transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/contacts"
              className="p-2 rounded-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 text-[#5A7ACD] hover:bg-[#5A7ACD] hover:text-white transition-all"
            >
              <ChevronLeft size={22} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#5A7ACD] text-white flex items-center justify-center shadow-lg shadow-[#5A7ACD]/25">
                <UserCircle2 size={30} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">
                  Contact Detail
                </p>
                <h1 className="text-2xl font-black tracking-tight">
                  {contact.name}
                </h1>
              </div>
            </div>
          </div>

          <button className="bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#5A7ACD]/20">
            Edit Contact
          </button>
        </div>

        <div className="flex flex-wrap gap-6 border-b border-[#5A7ACD]/20 text-sm font-bold">
          {[
            { key: "overview", label: "Overview" },
            { key: "documents", label: "Documents" },
            { key: "portals", label: "Client Portals" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-3 transition-colors ${
                activeTab === tab.key
                  ? "text-[#5A7ACD] border-b-2 border-[#5A7ACD]"
                  : "text-slate-400 hover:text-[#5A7ACD]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr] gap-6">
            <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Contact Information
                </div>
                <span className="px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#2B2A2A]/10 dark:border-white/10 text-[#5A7ACD]">
                  {primaryLabel}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <InfoRow label="Name" value={contact.name} />
                {contact.contactType !== "Personal" && (
                  <InfoRow
                    label="Business Type"
                    value={
                      contact.businessDetail?.businessType ||
                      contact.organizationDetail?.structureType ||
                      "-"
                    }
                  />
                )}
                <InfoRow
                  label="Tax Code"
                  value={
                    contact.businessDetail?.taxCode ||
                    contact.organizationDetail?.taxCode ||
                    "-"
                  }
                />
                <InfoRow
                  label="Lawyers"
                  value={
                    contact.businessDetail?.lawyers ||
                    contact.organizationDetail?.lawyers ||
                    contact.personalDetail?.office_position ||
                    "-"
                  }
                />
                <InfoRow
                  label="Document"
                  value={contactDocuments.length ? "Available" : "No document available"}
                />
                <InfoRow label="Phone Number" value={contact.phoneNumber} />
                <InfoRow label="Email" value={contact.email} />
                <InfoRow label="Address" value={contact.address} />
              </div>

              {contact.contactType === "Personal" && (
                <div className="mt-6 border-t border-[#5A7ACD]/10 pt-5 space-y-3">
                  <InfoRow
                    label="Citizenship"
                    value={contact.personalDetail?.citizenship}
                  />
                  <InfoRow
                    label="ID Number"
                    value={contact.personalDetail?.identificationNo}
                  />
                  <InfoRow
                    label="Gender"
                    value={contact.personalDetail?.gender}
                  />
                  <InfoRow
                    label="Birth Date"
                    value={formatDate(contact.personalDetail?.birthDate ?? null)}
                  />
                  <InfoRow
                    label="Religion"
                    value={contact.personalDetail?.religion}
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black">
                    <ChevronDown size={16} className="text-[#5A7ACD]" />
                    Contact Matter
                  </div>
                  <button className="px-4 py-2 rounded-xl border border-[#2B2A2A]/10 dark:border-white/10 text-[#5A7ACD] text-[10px] font-black uppercase tracking-widest hover:bg-[#5A7ACD] hover:text-white transition-all">
                    Add Matter
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[160px]">
                  {contactMatters.length === 0 ? (
                    <>
                      <Briefcase size={32} className="text-[#5A7ACD]" />
                      Matter not found
                    </>
                  ) : (
                    <div className="w-full space-y-3 text-left">
                      {contactMatters.slice(0, 3).map((matter) => (
                        <div
                          key={matter.id}
                          className="p-4 rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-[#F5F2F2] dark:bg-[#2B2A2A]"
                        >
                          <p className="text-sm font-black text-[#5A7ACD]">
                            {matter.caseArea} - {matter.caseType}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-white/50">
                            {matter.disputeResolution}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Contact Special Information
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[160px]">
                  {contact.additionalInfo ? (
                    <p className="text-sm text-[#2B2A2A] dark:text-white/90">
                      {contact.additionalInfo}
                    </p>
                  ) : (
                    <>
                      <ClipboardList size={32} className="text-[#5A7ACD]" />
                      Data not found
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black">
                    <ChevronDown size={16} className="text-[#5A7ACD]" />
                    Documents
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#5A7ACD] hover:text-[#FEB05D] transition-colors">
                    Show More
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[160px]">
                  {contactDocuments.length === 0 ? (
                    <>
                      <FolderOpen size={32} className="text-[#5A7ACD]" />
                      No documents found
                    </>
                  ) : (
                    <div className="w-full space-y-3 text-left">
                      {contactDocuments.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-[#F5F2F2] dark:bg-[#2B2A2A]"
                        >
                          {doc.type === "FILE" && resolveDocumentFileUrl(doc.fileUrl) ? (
                            <a
                              href={resolveDocumentFileUrl(doc.fileUrl) ?? undefined}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-black text-[#5A7ACD] hover:underline underline-offset-4"
                            >
                              {doc.name}
                            </a>
                          ) : (
                            <p className="text-sm font-black text-[#5A7ACD]">
                              {doc.name}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-white/50">
                            {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black">
                    <ChevronDown size={16} className="text-[#5A7ACD]" />
                    Client Portals
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#5A7ACD] hover:text-[#FEB05D] transition-colors">
                    Show More
                  </button>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[160px]">
                  <User size={32} className="text-[#5A7ACD]" />
                  No data
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search document"
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#5A7ACD]/40 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {["All", "File", "Folder"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDocFilter(filter as typeof docFilter)}
                      className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest ${
                        docFilter === filter
                          ? "bg-[#5A7ACD] text-white"
                          : "bg-white/50 dark:bg-[#333232] text-slate-400 hover:text-[#5A7ACD]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#5A7ACD] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-[#FEB05D] hover:text-[#2B2A2A] transition-all">
                <Plus size={14} /> Add document
              </button>
            </div>

            <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/50 font-black">
                  <tr>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Hyperlink</th>
                    <th className="px-6 py-4">Matter</th>
                    <th className="px-6 py-4">Last Edit</th>
                    <th className="px-6 py-4">Physical Storage</th>
                    <th className="px-6 py-4">Upload Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2A2A]/5 dark:divide-white/10">
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                          <div className="p-4 rounded-2xl bg-[#5A7ACD]/10">
                            <Folder size={32} className="text-[#5A7ACD]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">No documents found</p>
                            <p className="text-xs opacity-70">Add Document</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#5A7ACD]/5">
                        <td className="px-6 py-4">
                          {doc.type === "FOLDER" ? (
                            <Folder size={18} className="text-[#5A7ACD]" />
                          ) : (
                            <FileText size={18} className="text-slate-400" />
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#2B2A2A] dark:text-white">
                          {doc.type === "FILE" && resolveDocumentFileUrl(doc.fileUrl) ? (
                            <a
                              href={resolveDocumentFileUrl(doc.fileUrl) ?? undefined}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline underline-offset-4"
                            >
                              {doc.name}
                            </a>
                          ) : (
                            doc.name
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                          {doc.hyperlink ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                          {doc.matter?.caseArea ?? doc.matterId ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                          {formatDate(doc.lastEdit)}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                          {doc.physicalLocation ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                          {formatDate(doc.uploadDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "portals" && (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="p-4 rounded-2xl bg-[#5A7ACD]/10">
                <User size={32} className="text-[#5A7ACD]" />
              </div>
              <p className="text-sm font-semibold">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
