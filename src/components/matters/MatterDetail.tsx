"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Scale,
  Wallet,
  Receipt,
  Briefcase,
  ClipboardList,
  Folder,
  FileText,
  Users,
  CalendarClock,
  UserCircle2,
  Search,
  Plus,
  Upload,
  MoreVertical,
} from "lucide-react";
import { matterService, MatterItem, MatterStatus } from "@/services/matters";
import { contactService, Contact } from "@/services/contacts";
import {
  documentService,
  DocumentItem,
  resolveDocumentFileUrl,
} from "@/services/documents";
import { eventService, EventItem } from "@/services/events";

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

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start) return "-";
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "-";
  const endDate = end ? new Date(end) : null;
  const day = startDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startTime = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = endDate
    ? endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
  return `${day} | ${startTime} - ${endTime}`;
};

const formatStatusLabel = (status?: MatterStatus | null) => {
  if (!status) return "-";
  if (status === "DONE") return "Done";
  if (status === "IN_PROGRESS") return "In Progress";
  return "Pending";
};

const formatCurrency = (value = 0) => `IDR ${value.toFixed(2)}`;

const displayValue = (value?: string | null) => (value ? value : "-");

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="grid grid-cols-[180px_14px_1fr] items-start gap-2 text-sm">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/50">
      {label}
    </span>
    <span className="text-slate-300 dark:text-white/20">:</span>
    <span className="text-[#2B2A2A] dark:text-white/90 font-semibold">
      {displayValue(value)}
    </span>
  </div>
);

export default function MatterDetail() {
  const params = useParams();
  const matterId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "documents" | "cost-journal" | "tasks" | "contact"
  >("overview");
  const [matter, setMatter] = useState<MatterItem | null>(null);
  const [client, setClient] = useState<Contact | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docFilter, setDocFilter] = useState<"All" | "File" | "Folder">("All");
  const [docSearch, setDocSearch] = useState("");

  useEffect(() => {
    if (!matterId) return;
    let isActive = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [matterData, docs, eventsData] = await Promise.all([
          matterService.getById(String(matterId)),
          documentService.listAll(),
          eventService.list(),
        ]);

        let clientDetail: Contact | null = null;
        if (matterData?.clientId) {
          try {
            clientDetail = await contactService.getById(matterData.clientId);
          } catch {
            clientDetail = null;
          }
        }

        if (!isActive) return;
        setMatter(matterData);
        setDocuments(docs);
        setEvents(eventsData);
        setClient(clientDetail);
      } catch {
        if (isActive) {
          setError("Gagal memuat detail matter.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [matterId]);

  const matterDocuments = useMemo(() => {
    if (!matter) return [];
    return documents.filter(
      (doc) => doc.matterId === matter.id && !doc.isDeleted,
    );
  }, [documents, matter]);

  const filteredDocuments = useMemo(() => {
    const query = docSearch.trim().toLowerCase();
    return matterDocuments.filter((doc) => {
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
  }, [docFilter, docSearch, matterDocuments]);

  const agendaEvents = useMemo(() => {
    if (!matter) return [];
    return events
      .filter((event) => event.matterId === matter.id)
      .sort((a, b) => {
        const aDate = new Date(a.startTime).getTime();
        const bDate = new Date(b.startTime).getTime();
        return aDate - bDate;
      });
  }, [events, matter]);

  const clientName = client?.name ?? matter?.client?.name ?? "Client";
  const attorneyName = matter?.responsibleAttorney
    ? [matter.responsibleAttorney.firstName, matter.responsibleAttorney.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "-";
  const titleSuffix = matter?.id ? `#${matter.id.slice(0, 8).toUpperCase()}` : "";
  const title = matter
    ? `${clientName} - ${titleSuffix} - ${matter.caseType}`
    : "Matter Detail";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] p-6 text-[#2B2A2A] dark:text-[#F5F2F2]">
        <div className="max-w-7xl mx-auto text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] p-6 text-[#2B2A2A] dark:text-[#F5F2F2]">
        <div className="max-w-7xl mx-auto text-sm text-red-500">
          {error ?? "Matter not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/matters"
              className="p-2 rounded-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 text-[#5A7ACD] hover:bg-[#5A7ACD] hover:text-white transition-all"
            >
              <ChevronLeft size={22} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#5A7ACD] text-white flex items-center justify-center shadow-lg shadow-[#5A7ACD]/25">
                <Scale size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">
                  Matter Detail
                </p>
                <h1 className="text-2xl font-black tracking-tight">{title}</h1>
              </div>
            </div>
          </div>

          <button className="bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#5A7ACD]/20">
            Edit Matter
          </button>
        </div>

        <div className="flex flex-wrap gap-6 border-b border-[#5A7ACD]/20 text-sm font-bold">
          {[
            { key: "overview", label: "Overview" },
            { key: "transactions", label: "Transactions" },
            { key: "documents", label: "Documents" },
            { key: "cost-journal", label: "Cost Journal" },
            { key: "tasks", label: "Tasks" },
            { key: "contact", label: "Contact" },
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
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black">
                <ChevronDown size={16} className="text-[#5A7ACD]" />
                Matter Financial Information
              </div>

              <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                <div className="border border-[#2B2A2A]/10 dark:border-white/10 rounded-2xl p-6 bg-[#F5F2F2] dark:bg-[#2B2A2A]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-sm text-slate-500 dark:text-white/50">
                      {matter.paymentMethod ? (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                            Payment Method
                          </p>
                          <p className="mt-2 text-[#2B2A2A] dark:text-white font-semibold">
                            {matter.paymentMethod}
                          </p>
                        </div>
                      ) : (
                        "Payment method not found"
                      )}
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold">Total Billable Time:</p>
                        <p className="text-lg font-black">{formatCurrency(0)}</p>
                        <button className="mt-3 px-4 py-2 rounded-xl bg-[#5A7ACD] text-white text-xs font-black uppercase tracking-widest hover:bg-[#FEB05D] hover:text-[#2B2A2A] transition-all">
                          + Time Record
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Total Expense:</p>
                        <p className="text-lg font-black">{formatCurrency(0)}</p>
                        <button className="mt-3 px-4 py-2 rounded-xl bg-[#5A7ACD] text-white text-xs font-black uppercase tracking-widest hover:bg-[#FEB05D] hover:text-[#2B2A2A] transition-all">
                          + Expense
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Total Cost</p>
                      <p className="text-lg font-black">{formatCurrency(0)}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#2B2A2A]/10 dark:border-white/10 rounded-2xl p-6 bg-[#F5F2F2] dark:bg-[#2B2A2A] flex flex-col justify-between">
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold">Deposit Funds:</p>
                      <p className="text-lg font-black">{formatCurrency(0)}</p>
                      <button className="mt-3 px-4 py-2 rounded-xl bg-[#5A7ACD] text-white text-xs font-black uppercase tracking-widest hover:bg-[#FEB05D] hover:text-[#2B2A2A] transition-all">
                        Fund Request
                      </button>
                    </div>
                    <div className="border-t border-[#2B2A2A]/10 dark:border-white/10 pt-5">
                      <p className="text-sm font-semibold">Outstanding Bill:</p>
                      <p className="text-lg font-black">{formatCurrency(0)}</p>
                      <button className="mt-3 px-4 py-2 rounded-xl bg-[#5A7ACD] text-white text-xs font-black uppercase tracking-widest hover:bg-[#FEB05D] hover:text-[#2B2A2A] transition-all">
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Matter Information
                </div>
                <div className="mt-6 space-y-4">
                  <InfoRow label="Case Type" value={matter.caseType} />
                  <InfoRow label="Address" value={matter.address} />
                  <InfoRow label="Responsible Attorney" value={attorneyName} />
                  <InfoRow label="Group / Members" value={matter.members} />
                  <InfoRow label="Dispute Resolution" value={matter.disputeResolution} />
                  <InfoRow label="Case Area" value={matter.caseArea} />
                  <InfoRow label="Status" value={formatStatusLabel(matter.status)} />
                  <InfoRow label="Description" value={matter.description} />
                  <InfoRow label="Start Date" value={formatDate(matter.startDate)} />
                  <InfoRow label="Pending Date" value={formatDate(matter.pendingDate)} />
                  <InfoRow label="Close Date" value={formatDate(matter.closeDate)} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Client Information
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#5A7ACD]/10 border border-[#5A7ACD]/30 flex items-center justify-center">
                    <UserCircle2 className="text-[#5A7ACD]" size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{clientName}</p>
                    <p className="text-xs text-slate-400 dark:text-white/40">
                      {client?.email ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <InfoRow label="Name" value={client?.name ?? clientName} />
                  <InfoRow
                    label="Date of birth"
                    value={formatDate(client?.personalDetail?.birthDate ?? null)}
                  />
                  <InfoRow label="Gender" value={client?.personalDetail?.gender} />
                  <InfoRow
                    label="Citizenship"
                    value={client?.personalDetail?.citizenship}
                  />
                  <InfoRow
                    label="Identification number"
                    value={client?.personalDetail?.identificationNo}
                  />
                  <InfoRow label="Religion" value={client?.personalDetail?.religion} />
                  <InfoRow
                    label="Position"
                    value={client?.personalDetail?.office_position}
                  />
                  <InfoRow
                    label="Document"
                    value={matterDocuments.length ? "Available" : "No document available"}
                  />
                  <InfoRow label="Phone Number" value={client?.phoneNumber} />
                  <InfoRow label="Email" value={client?.email} />
                  <InfoRow label="Address" value={client?.address} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Cost Summary
                </div>
                <div className="mt-6 space-y-4">
                  <InfoRow label="Total Billable Time" value={formatCurrency(0)} />
                  <InfoRow label="Total Expense" value={formatCurrency(0)} />
                  <InfoRow label="Amount Cost" value={formatCurrency(0)} />
                  <InfoRow label="Maximal Budget" value={formatCurrency(0)} />
                  <InfoRow label="Remaining Budget" value={formatCurrency(0)} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Special Information
                </div>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[220px]">
                  {matter.additionalInfo ? (
                    <p className="text-sm text-[#2B2A2A] dark:text-white/90">
                      {matter.additionalInfo}
                    </p>
                  ) : (
                    <>
                      <ClipboardList size={32} className="text-[#5A7ACD]" />
                      No special information
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-black">
                    <ChevronDown size={16} className="text-[#5A7ACD]" />
                    Relate Contact
                  </div>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[160px]">
                    {client ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-[#5A7ACD]/10 border border-[#5A7ACD]/30 flex items-center justify-center text-[#5A7ACD] font-black">
                          {client.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-[#2B2A2A] dark:text-white">
                          {client.name}
                        </p>
                      </>
                    ) : (
                      <>
                        <Users size={32} className="text-[#5A7ACD]" />
                        Contact not found
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
                  <div className="mt-6 flex flex-col gap-4">
                    {matterDocuments.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Folder size={32} className="text-[#5A7ACD]" />
                        No documents found
                      </div>
                    ) : (
                      matterDocuments.slice(0, 2).map((doc) => (
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
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Agenda
                </div>
                <div className="mt-6 space-y-4">
                  {agendaEvents.length === 0 ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <CalendarClock size={22} className="text-[#5A7ACD]" />
                      No agenda found
                    </div>
                  ) : (
                    agendaEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="border border-[#2B2A2A]/10 dark:border-white/10 rounded-2xl p-4 bg-[#F5F2F2] dark:bg-[#2B2A2A] flex gap-4"
                      >
                        <div className="w-1 bg-[#FF3131] rounded-full" />
                        <div>
                          <p className="text-sm font-bold">{event.title}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">
                            {formatDateRange(event.startTime, event.endTime)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black">
                  <ChevronDown size={16} className="text-[#5A7ACD]" />
                  Activity Log
                </div>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-slate-400 min-h-[180px]">
                  <FileText size={32} className="text-[#5A7ACD]" />
                  No activity found
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="p-4 rounded-2xl bg-[#5A7ACD]/10">
                <Receipt size={32} className="text-[#5A7ACD]" />
              </div>
              <p className="text-sm font-semibold">
                You do not have permission to access this page.
              </p>
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

        {activeTab === "cost-journal" && (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="p-4 rounded-2xl bg-[#5A7ACD]/10">
                <Wallet size={32} className="text-[#5A7ACD]" />
              </div>
              <p className="text-sm font-semibold">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="p-4 rounded-2xl bg-[#5A7ACD]/10">
                <Briefcase size={32} className="text-[#5A7ACD]" />
              </div>
              <p className="text-sm font-semibold">No task data available.</p>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Search contact"
                  className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#5A7ACD]/40 outline-none"
                />
              </div>
              <div className="flex gap-2">
                {["All", "Client", "Non Client"].map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest ${
                      filter === "Client"
                        ? "bg-[#5A7ACD] text-white"
                        : "bg-white/50 dark:bg-[#333232] text-slate-400 hover:text-[#5A7ACD]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#5A7ACD]">
                <Upload size={14} /> Export
              </button>
            </div>

            <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/50 font-black">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4 text-right">
                      <MoreVertical size={16} className="inline opacity-40" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2A2A]/5 dark:divide-white/10">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-[#2B2A2A] dark:text-white">
                      {clientName}
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                      {client?.isClient === "CLIENT" ? "Client" : "Non Client"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                      {client?.phoneNumber ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                      {client?.email ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-white/50">
                      {client?.address ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      <button className="text-xs font-semibold hover:text-[#5A7ACD]">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
