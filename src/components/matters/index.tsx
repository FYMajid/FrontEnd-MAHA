"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, ArrowUpDown, Calendar, Scale, X, ChevronDown, LayoutGrid, List as ListIcon, Filter, MoreVertical, Briefcase } from 'lucide-react';
import { matterService, MatterItem, MatterStatus } from "@/services/matters";
import { contactService, Contact } from "@/services/contacts";
import { userService } from "@/services/user";
import type { AuthUser } from "@/services/auth";
import Link from "next/link";

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

const CASE_AREA_OPTIONS = [
  "Civil",
  "Corporate",
  "Criminal",
  "Family",
  "Labor",
  "Intellectual Property",
];
const CASE_TYPE_OPTIONS = [
  "Traffic",
  "Contract Review",
  "Litigation",
  "Compliance",
  "Property",
  "Employment",
];
const DISPUTE_OPTIONS = ["Litigation", "Non Litigation", "Arbitration", "Mediation"];
const PAYMENT_METHOD_OPTIONS = ["Hourly", "Fixed", "Retainer", "Pro Bono", "Other"];

const initialFormState = {
  clientId: "",
  responsibleAttorneyId: "",
  members: "",
  caseArea: "",
  caseType: "",
  disputeResolution: "",
  description: "",
  status: "PENDING" as MatterStatus,
  startDate: "",
  pendingDate: "",
  closeDate: "",
};

const normalizeValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const inputClassName =
  "w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all " +
  "bg-white text-[#2B2A2A] border-[#2B2A2A]/10 placeholder:text-[#2B2A2A]/40 " +
  "focus:border-[#5A7ACD] focus:ring-2 focus:ring-[#5A7ACD]/10 " +
  "dark:bg-[#1C1C1C] dark:text-[#F5F2F2] dark:border-[#3A3A3A] dark:placeholder:text-white/40 " +
  "dark:focus:border-[#5A7ACD] dark:focus:ring-[#5A7ACD]/20";

const selectClassName = `${inputClassName} appearance-none`;
const textareaClassName = `${inputClassName} min-h-[140px]`;
const dividerClassName = "border-t border-[#2B2A2A]/10 dark:border-white/10";
const subtleButtonClassName =
  "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all " +
  "bg-[#D9D9D9] text-[#2B2A2A] hover:bg-[#CFCFCF] " +
  "dark:bg-[#3A3A3A] dark:text-white/80 dark:hover:bg-[#4A4A4A]";

type AddressItem = {
  id: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
  isPrimary: boolean;
};

type RelatedContactItem = {
  id: string;
  contactId: string;
  description: string;
};

type PaymentMethodItem = {
  id: string;
  method: string;
};

type AdditionalInfoItem = {
  id: string;
  question: string;
  answer: string;
};

export default function ResponsiveMattersManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const membersInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [relatedContacts, setRelatedContacts] = useState<RelatedContactItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [maximumBudget, setMaximumBudget] = useState("");
  const [additionalInfos, setAdditionalInfos] = useState<AdditionalInfoItem[]>([]);

  const resetForm = () => {
    setForm(initialFormState);
    setFormError(null);
    setAddresses([]);
    setRelatedContacts([]);
    setPaymentMethods([]);
    setMaximumBudget("");
    setAdditionalInfos([]);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

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
    setIsReferenceLoading(true);
    setReferenceError(null);

    Promise.allSettled([contactService.list(), userService.getMe()])
      .then((results) => {
        if (!isActive) return;
        const [contactsResult, userResult] = results;

        if (contactsResult.status === "fulfilled") {
          setContacts(contactsResult.value);
        } else {
          setReferenceError("Gagal memuat kontak.");
        }

        if (userResult.status === "fulfilled") {
          setCurrentUser(userResult.value.user);
          setForm((prev) =>
            prev.responsibleAttorneyId
              ? prev
              : { ...prev, responsibleAttorneyId: userResult.value.user.id },
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsReferenceLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const clientOptions = useMemo(
    () => contacts.filter((contact) => contact.isClient === "CLIENT"),
    [contacts],
  );

  const formatAddress = (item: AddressItem) => {
    const parts = [
      normalizeValue(item.address),
      normalizeValue(item.city),
      normalizeValue(item.province),
      normalizeValue(item.postalCode),
    ].filter(Boolean);
    const base = parts.join(", ");
    return item.isPrimary ? `${base} (Primary)` : base;
  };

  const buildAddressPayload = () => {
    if (addresses.length === 0) return undefined;
    const formatted = addresses
      .map(formatAddress)
      .filter((value) => value && value !== "(Primary)");
    return formatted.length > 0 ? formatted.join(" | ") : undefined;
  };

  const buildAdditionalInfoPayload = () => {
    const parts: string[] = [];
    const budget = normalizeValue(maximumBudget);
    if (budget) {
      parts.push(`Maximum Budget: ${budget}`);
    }

    if (paymentMethods.length > 1) {
      const extras = paymentMethods
        .slice(1)
        .map((item, index) => `${index + 2}. ${item.method}`)
        .filter(Boolean)
        .join(", ");
      if (extras) {
        parts.push(`Other Payment Methods: ${extras}`);
      }
    }

    additionalInfos.forEach((info, index) => {
      const question = normalizeValue(info.question);
      const answer = normalizeValue(info.answer);
      if (question || answer) {
        parts.push(
          `Q${index + 1}: ${question ?? "-"} | A: ${answer ?? "-"}`,
        );
      }
    });

    return parts.length > 0 ? parts.join(" | ") : undefined;
  };

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        id: createId(),
        address: "",
        province: "",
        city: "",
        postalCode: "",
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const updateAddress = (
    id: string,
    field: keyof Omit<AddressItem, "id">,
    value: string | boolean,
  ) => {
    setAddresses((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const setPrimaryAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((item) => ({ ...item, isPrimary: item.id === id })),
    );
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (next.length > 0 && !next.some((item) => item.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return [...next];
    });
  };

  const addRelatedContact = () => {
    setRelatedContacts((prev) => [
      ...prev,
      { id: createId(), contactId: "", description: "" },
    ]);
  };

  const updateRelatedContact = (
    id: string,
    field: "contactId" | "description",
    value: string,
  ) => {
    setRelatedContacts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeRelatedContact = (id: string) => {
    setRelatedContacts((prev) => prev.filter((item) => item.id !== id));
  };

  const addPaymentMethod = () => {
    setPaymentMethods((prev) => [
      ...prev,
      { id: createId(), method: "" },
    ]);
  };

  const updatePaymentMethod = (id: string, value: string) => {
    setPaymentMethods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, method: value } : item)),
    );
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((item) => item.id !== id));
  };

  const addAdditionalInfo = () => {
    setAdditionalInfos((prev) => [
      ...prev,
      { id: createId(), question: "", answer: "" },
    ]);
  };

  const updateAdditionalInfo = (
    id: string,
    field: "question" | "answer",
    value: string,
  ) => {
    setAdditionalInfos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeAdditionalInfo = (id: string) => {
    setAdditionalInfos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateMatter = async () => {
    setFormError(null);

    const clientId = normalizeValue(form.clientId);
    const responsibleAttorneyId = normalizeValue(form.responsibleAttorneyId);
    const caseArea = normalizeValue(form.caseArea);
    const caseType = normalizeValue(form.caseType);
    const disputeResolution = normalizeValue(form.disputeResolution);

    if (!clientId) {
      setFormError("Client wajib diisi.");
      return;
    }

    if (!responsibleAttorneyId) {
      setFormError("Responsible attorney wajib diisi.");
      return;
    }

    if (!caseArea || !caseType || !disputeResolution) {
      setFormError("Case area, case type, dan dispute resolution wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const membersValue = normalizeValue(form.members);
      const relatedLabels = relatedContacts
        .map((item) => {
          if (!item.contactId) return null;
          const name =
            contacts.find((contact) => contact.id === item.contactId)?.name ??
            "Unknown";
          const description = normalizeValue(item.description);
          return description ? `${name} (${description})` : name;
        })
        .filter(Boolean);
      const combinedMembers = [membersValue, ...relatedLabels]
        .filter(Boolean)
        .join(", ");
      const addressPayload = buildAddressPayload();
      const paymentMethodPayload =
        normalizeValue(paymentMethods[0]?.method ?? "") ?? undefined;
      const additionalInfoPayload = buildAdditionalInfoPayload();

      const payload = {
        clientId,
        responsibleAttorneyId,
        members: combinedMembers || undefined,
        caseArea,
        caseType,
        disputeResolution,
        description: normalizeValue(form.description),
        address: addressPayload,
        status: form.status,
        startDate: form.startDate || undefined,
        pendingDate: form.pendingDate || undefined,
        closeDate: form.closeDate || undefined,
        paymentMethod: paymentMethodPayload,
        additionalInfo: additionalInfoPayload,
      };

      const created = await matterService.create(payload);
      const matchedClient = contacts.find((contact) => contact.id === clientId);
      const enhancedMatter: MatterItem = {
        ...created,
        client: matchedClient ? { name: matchedClient.name } : created.client,
        responsibleAttorney: currentUser
          ? { firstName: currentUser.firstName, lastName: currentUser.lastName }
          : created.responsibleAttorney,
      };
      setMatters((prev) => [enhancedMatter, ...prev]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError("Gagal menyimpan matter. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
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
    // Penambahan overflow-x-hidden di sini untuk mematikan scroll horizontal layar browser
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-6 transition-colors duration-300 overflow-x-hidden">   
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-[#2B2A2A] dark:text-[#F5F2F2]">Matter Management</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5A7ACD]">MAHA Legal Tech System</p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="w-full sm:w-auto bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-8 py-3.5 rounded-2xl flex justify-center items-center gap-3 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-[#5A7ACD]/20 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Add New Matter
          </button>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Matters', value: matters.filter(m => m.status === 'IN_PROGRESS').length, icon: Briefcase, color: 'text-[#5A7ACD]', bg: 'bg-[#5A7ACD]/10' },
            { label: 'Pending Review', value: matters.filter(m => m.status === 'PENDING').length, icon: Calendar, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
            { label: 'Closed Cases', value: matters.filter(m => m.status === 'DONE').length, icon: Scale, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
            { label: 'Total Matters', value: matters.length, icon: ListIcon, color: 'text-[#2B2A2A] dark:text-[#F5F2F2]', bg: 'bg-[#2B2A2A]/5 dark:bg-[#F5F2F2]/5' }
          ].map((metric, i) => (
            <div key={i} className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl ${metric.bg}`}>
                <metric.icon size={24} className={metric.color} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{metric.label}</p>
                <p className="text-2xl font-black">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10">
          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by case title, client, or attorney..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#2B2A2A] dark:text-[#F5F2F2] placeholder-[#2B2A2A]/30 dark:placeholder-[#F5F2F2]/30 outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 w-full sm:w-auto">
              {['All', 'Pending', 'In Progress', 'Done', 'Archived'].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all border ${
                    activeFilter === filter 
                    ? 'bg-[#2B2A2A] text-[#F5F2F2] dark:bg-[#F5F2F2] dark:text-[#2B2A2A] border-transparent shadow-md' 
                    : 'bg-white dark:bg-[#333232] text-[#2B2A2A]/60 dark:text-[#F5F2F2]/60 border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 hover:border-[#5A7ACD]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* View Toggles (Mock/UI only for now) */}
            <div className="hidden sm:flex bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-[#5A7ACD]/10 text-[#5A7ACD]' : 'opacity-40 hover:opacity-100'}`}
              >
                <ListIcon size={18} />
              </button>
              <button 
                onClick={() => setViewMode('GRID')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'GRID' ? 'bg-[#5A7ACD]/10 text-[#5A7ACD]' : 'opacity-40 hover:opacity-100'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- TABEL SECTION (SCROLL HANYA DI SINI) --- */}
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[2rem] shadow-xl overflow-hidden">
          {/* Container dengan max-height dan scroll internal */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-[#5A7ACD]/50 scrollbar-track-transparent">
            <table className="w-full text-left text-sm min-w-[1000px] border-collapse">
              <thead className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 !text-xs">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Case Title</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Client</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Attorney</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Dispute</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Start Date</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">Last Update</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A2A]/5 dark:divide-[#F5F2F2]/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center gap-3 text-sm font-bold opacity-50 uppercase tracking-widest animate-pulse">
                        <Scale size={20} className="animate-bounce" /> Loading matters...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-red-500 font-bold">
                      {error}
                    </td>
                  </tr>
                ) : filteredMatters.length === 0 ? (
                  <tr>
                     <td colSpan={8} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <div className="bg-[#2B2A2A]/5 dark:bg-[#F5F2F2]/5 p-6 rounded-full">
                          <Scale size={40} className="text-[#5A7ACD]" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">No matters found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMatters.map((matter) => {
                    const clientName = matter.client?.name ?? "Unknown Client";
                    const attorneyName = [matter.responsibleAttorney?.firstName, matter.responsibleAttorney?.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || "-";
                    const title = `${matter.caseArea} - ${matter.caseType}`;

                    return (
                      <tr key={matter.id} className="hover:bg-[#5A7ACD]/5 dark:hover:bg-[#5A7ACD]/10 transition-colors group cursor-pointer">
                        <td className="px-6 py-5">
                          <Link href={`/matters/${matter.id}`} className="block">
                            <div className="font-bold text-[#5A7ACD] mb-1">{title}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest opacity-40">{matter.id.split('-')[0].toUpperCase()}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          {matter.clientId ? (
                            <Link href={`/contacts/${matter.clientId}`} className="font-bold hover:text-[#5A7ACD] transition-colors">
                              {clientName}
                            </Link>
                          ) : (
                            <span className="font-bold">{clientName}</span>
                          )}
                        </td>
                        <td className="px-6 py-5 font-bold opacity-80">
                          {attorneyName}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             matter.status === "DONE" 
                             ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                             : matter.status === "IN_PROGRESS"
                             ? "bg-[#5A7ACD]/10 text-[#5A7ACD] border-[#5A7ACD]/20"
                             : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                          }`}>
                            {formatStatusLabel(matter.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-[#2B2A2A]/5 dark:bg-[#F5F2F2]/5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            {matter.disputeResolution}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-bold opacity-60">
                          {formatDate(matter.startDate)}
                        </td>
                        <td className="px-6 py-5 text-right font-bold opacity-50 group-hover:opacity-100 transition-opacity">
                          {formatDate(matter.updatedAt ?? matter.createdAt ?? null)}
                        </td>
                        <td className="px-3 py-5 text-center">
                          <button className="p-2 opacity-30 hover:opacity-100 hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 rounded-xl transition-all" title="Quick Actions">
                            <MoreVertical size={16} />
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

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2B2A2A]/70 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-[#F5F2F2] text-[#2B2A2A] dark:bg-[#2B2A2A] dark:text-[#F5F2F2] w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-[#2B2A2A]/10 dark:border-white/10 animate-in slide-in-from-bottom sm:zoom-in duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b border-[#2B2A2A]/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#5A7ACD]">
                <Scale size={22} />
                <h2 className="text-xl font-black tracking-tight">Add Matter</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full transition-all hover:bg-[#2B2A2A]/10 dark:hover:bg-white/10"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <h3 className="text-base font-semibold">Matter Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <select
                      value={form.clientId}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, clientId: e.target.value }))
                      }
                      disabled={isReferenceLoading}
                      className={selectClassName}
                    >
                      <option value="">
                        {isReferenceLoading ? "Loading client..." : "Client"}
                      </option>
                      {clientOptions.length === 0 && !isReferenceLoading ? (
                        <option value="" disabled>
                          Tidak ada client
                        </option>
                      ) : (
                        clientOptions.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                      size={18}
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={form.responsibleAttorneyId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          responsibleAttorneyId: e.target.value,
                        }))
                      }
                      disabled={!currentUser}
                      className={selectClassName}
                    >
                      <option value="">
                        {currentUser ? "Responsible Attorney" : "Login required"}
                      </option>
                      {currentUser && (
                        <option value={currentUser.id}>
                          {[currentUser.firstName, currentUser.lastName]
                            .filter(Boolean)
                            .join(" ")
                            .trim() || currentUser.email}
                        </option>
                      )}
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                      size={18}
                    />
                  </div>

                  <input
                    ref={membersInputRef}
                    type="text"
                    placeholder="Members"
                    value={form.members}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, members: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
              </section>

              <div className={dividerClassName} />

              <section className="space-y-4">
                <h3 className="text-base font-semibold">Matter Classification</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <select
                      value={form.caseArea}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, caseArea: e.target.value }))
                      }
                      className={selectClassName}
                    >
                      <option value="">Case Area</option>
                      {CASE_AREA_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                      size={18}
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={form.caseType}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, caseType: e.target.value }))
                      }
                      className={selectClassName}
                    >
                      <option value="">Case Type</option>
                      {CASE_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                      size={18}
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={form.disputeResolution}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          disputeResolution: e.target.value,
                        }))
                      }
                      className={selectClassName}
                    >
                      <option value="">Dispute Resolution</option>
                      {DISPUTE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                      size={18}
                    />
                  </div>

                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={textareaClassName}
                  />
                </div>
              </section>

              <div className={dividerClassName} />

              <section className="space-y-4">
                <h3 className="text-base font-semibold">Detail Location</h3>
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-xs text-[#2B2A2A]/50 dark:text-white/50">
                      Belum ada address yang ditambahkan.
                    </p>
                  ) : (
                    addresses.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/70 dark:bg-[#1C1C1C] p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#5A7ACD]">
                            Address {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeAddress(item.id)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-all"
                            aria-label="Remove address"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Address"
                          value={item.address}
                          onChange={(e) =>
                            updateAddress(item.id, "address", e.target.value)
                          }
                          className={inputClassName}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Province"
                            value={item.province}
                            onChange={(e) =>
                              updateAddress(item.id, "province", e.target.value)
                            }
                            className={inputClassName}
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={item.city}
                            onChange={(e) =>
                              updateAddress(item.id, "city", e.target.value)
                            }
                            className={inputClassName}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={item.postalCode}
                            onChange={(e) =>
                              updateAddress(item.id, "postalCode", e.target.value)
                            }
                            className={inputClassName}
                          />
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#2B2A2A] dark:text-white">
                            <input
                              type="checkbox"
                              checked={item.isPrimary}
                              onChange={() => setPrimaryAddress(item.id)}
                              className="accent-[#5A7ACD]"
                            />
                            Primary
                          </label>
                        </div>
                      </div>
                    ))
                  )}

                  <button type="button" onClick={addAddress} className={subtleButtonClassName}>
                    <Plus size={16} /> Add Address
                  </button>
                </div>
              </section>

              <div className={dividerClassName} />

              <section className="space-y-4">
                <h3 className="text-base font-semibold">Matter Timeline</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as MatterStatus,
                        }))
                      }
                      className={selectClassName}
                    >
                      <option value="PENDING">Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <ChevronDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                      size={18}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                    <Calendar
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/40"
                      size={18}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={form.pendingDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pendingDate: e.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                    <Calendar
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/40"
                      size={18}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={form.closeDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          closeDate: e.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                    <Calendar
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/40"
                      size={18}
                    />
                  </div>
                </div>
              </section>

              <div className={dividerClassName} />

              <section className="space-y-4">
                <h3 className="text-base font-semibold">Related Contacts</h3>
                <div className="space-y-4">
                  {relatedContacts.length === 0 ? (
                    <p className="text-xs text-[#2B2A2A]/50 dark:text-white/50">
                      Belum ada related contact.
                    </p>
                  ) : (
                    relatedContacts.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/70 dark:bg-[#1C1C1C] p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#5A7ACD]">
                            Related Contact {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeRelatedContact(item.id)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-all"
                            aria-label="Remove related contact"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="relative">
                          <select
                            value={item.contactId}
                            onChange={(e) =>
                              updateRelatedContact(
                                item.id,
                                "contactId",
                                e.target.value,
                              )
                            }
                            className={selectClassName}
                          >
                            <option value="">Client</option>
                            {contacts.map((contact) => (
                              <option key={contact.id} value={contact.id}>
                                {contact.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                            size={18}
                          />
                        </div>

                        <textarea
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateRelatedContact(
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          className={textareaClassName}
                        />
                      </div>
                    ))
                  )}

                  <button type="button" onClick={addRelatedContact} className={subtleButtonClassName}>
                    <Plus size={16} /> Add Related Contacts
                  </button>
                </div>
              </section>

              <div className={dividerClassName} />

              <section className="space-y-4">
                <h3 className="text-base font-semibold">Payment Method</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Maximum Budget"
                    value={maximumBudget}
                    onChange={(e) => setMaximumBudget(e.target.value)}
                    className={inputClassName}
                  />

                  {paymentMethods.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/70 dark:bg-[#1C1C1C] p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#5A7ACD]">
                          Payment Method {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(item.id)}
                          className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-all"
                          aria-label="Remove payment method"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="relative">
                        <select
                          value={item.method}
                          onChange={(e) => updatePaymentMethod(item.id, e.target.value)}
                          className={selectClassName}
                        >
                          <option value="">Payment Method</option>
                          {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/50"
                          size={18}
                        />
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={addPaymentMethod} className={subtleButtonClassName}>
                    <Plus size={16} /> Add Payment Method
                  </button>
                </div>
              </section>

              <div className={dividerClassName} />

              <section className="space-y-4">
                <h3 className="text-base font-semibold">Additional Information</h3>
                <div className="space-y-4">
                  {additionalInfos.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/70 dark:bg-[#1C1C1C] p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#5A7ACD]">
                          Additional Information {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeAdditionalInfo(item.id)}
                          className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-all"
                          aria-label="Remove additional info"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) =>
                          updateAdditionalInfo(item.id, "question", e.target.value)
                        }
                        className={inputClassName}
                      />
                      <input
                        type="text"
                        placeholder="Answer"
                        value={item.answer}
                        onChange={(e) =>
                          updateAdditionalInfo(item.id, "answer", e.target.value)
                        }
                        className={inputClassName}
                      />
                    </div>
                  ))}

                  <button type="button" onClick={addAdditionalInfo} className={subtleButtonClassName}>
                    <Plus size={16} /> Add Information
                  </button>
                </div>
              </section>

              {referenceError && (
                <p className="text-xs text-red-500">{referenceError}</p>
              )}
              {formError && <p className="text-xs text-red-500">{formError}</p>}
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-[#2B2A2A]/10 dark:border-white/10 bg-[#EFEDED] dark:bg-[#252525] flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#2B2A2A]/60 hover:text-[#2B2A2A] dark:text-white/70 dark:hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMatter}
                disabled={isSaving}
                className="px-10 py-3 bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5A7ACD]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
