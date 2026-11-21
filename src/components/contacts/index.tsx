"use client";
import React, { useEffect, useState } from "react";
import { 
  Users, Search, Plus, Mail, Phone, MapPin, 
  MoreVertical, Upload, X, Camera, ChevronDown 
} from 'lucide-react';
import { contactService, Contact, ContactFilter } from "@/services/contacts";
import Link from "next/link";

const FILTER_OPTIONS: Array<{ label: string; value: ContactFilter }> = [
  { label: "All", value: "All" },
  { label: "Client", value: "CLIENT" },
  { label: "Non Client", value: "NON_CLIENT" },
];

const ENTITY_OPTIONS = [
  "Personal",
  "Limited Liability Company",
  "Cooperative",
  "Foundation",
  "Community Organization",
  "Sole Proprietorship",
];

const ORGANIZATION_TYPES = new Set([
  "Cooperative",
  "Foundation",
  "Community Organization",
]);

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const RELIGION_OPTIONS = [
  "Islam",
  "Christian",
  "Catholic",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Other",
];

const formatContactDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getClientLabel = (status: Contact["isClient"]) =>
  status === "CLIENT" ? "Client" : "Non Client";

const normalizeValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getCreatorValue = () => {
  if (typeof window === "undefined") return "system";
  return window.localStorage.getItem("userId") || "system";
};

export default function ContactsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>("All");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contactService.list({
        search: search.trim() || undefined,
        filter,
      });
      setContacts(data);
    } catch (err) {
      setError("Gagal memuat kontak. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    const handle = setTimeout(async () => {
      try {
        const data = await contactService.list({
          search: search.trim() || undefined,
          filter,
        });

        if (isActive) {
          setContacts(data);
        }
      } catch (err) {
        if (isActive) {
          setError("Gagal memuat kontak. Coba lagi.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(handle);
    };
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-6 transition-colors duration-300">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#5A7ACD] rounded-xl text-[#F5F2F2]">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Contacts</h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#5A7ACD]/20"
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto bg-white/50 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-[#5A7ACD]/20 flex flex-col md:flex-row gap-4 items-center justify-between mb-8 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7ACD]" />
          <input 
            type="text" 
            placeholder="Search contact..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-[#5A7ACD]/30 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5A7ACD] outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex bg-[#F5F2F2] dark:bg-[#1a1a1a] p-1.5 rounded-xl border border-[#5A7ACD]/20">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === option.value 
                ? 'bg-[#5A7ACD] text-[#F5F2F2] shadow-md' 
                : 'text-slate-400 hover:text-[#5A7ACD]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto bg-white/30 dark:bg-black/10 rounded-3xl border border-[#5A7ACD]/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#5A7ACD] text-[#F5F2F2] uppercase text-[11px] tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">Name <ChevronDown size={14} className="inline ml-1" /></th>
                <th className="px-8 py-5 text-center">Type</th>
                <th className="px-8 py-5">Phone Number</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5 text-right">Address</th>
                <th className="px-8 py-5 text-right">Last Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5A7ACD]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-400">
                    Loading contacts...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-400">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#5A7ACD]/5 transition-colors group">
                    <td className="px-8 py-5 font-bold text-[#5A7ACD]">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="hover:text-[#FEB05D] transition-colors"
                      >
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#5A7ACD]/10 text-[#5A7ACD] text-[10px] font-black uppercase flex items-center gap-1.5">
                          <Users size={10} /> {getClientLabel(contact.isClient)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 opacity-70">{contact.phoneNumber || "-"}</td>
                    <td className="px-8 py-5 opacity-70 italic">{contact.email || "-"}</td>
                    <td className="px-8 py-5 text-right opacity-70">{contact.address || "-"}</td>
                    <td className="px-8 py-5 text-right text-xs font-medium opacity-60 group-hover:opacity-100">
                      {formatContactDate(contact.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <AddContactModal
          onClose={() => setIsOpen(false)}
          onCreated={refreshContacts}
        />
      )}
    </div>
  );
}

function AddContactModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const [contactType, setContactType] = useState('Client'); // Client / Non Client
  const [entityType, setEntityType] = useState('Personal'); // Personal / Limited Liability, etc
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    additionalInfo: "",
    personalData: {
      citizenship: "",
      identificationNo: "",
      office_position: "",
      gender: "",
      birthDate: "",
      religion: "",
    },
    businessData: {
      businessType: "",
      taxCode: "",
      commissioners: "",
      directors: "",
      shareholders: "",
      lawyers: "",
    },
    organizationData: {
      structureType: "Foundation",
      taxCode: "",
      maintainers: "",
      mentors: "",
      supervisors: "",
      members: "",
      lawyers: "",
    },
  });

  const isPersonal = entityType === "Personal";
  const isOrganization = ORGANIZATION_TYPES.has(entityType);
  const isBusiness = !isPersonal && !isOrganization;

  const handleEntityChange = (value: string) => {
    setEntityType(value);
    if (ORGANIZATION_TYPES.has(value)) {
      setForm((prev) => ({
        ...prev,
        organizationData: {
          ...prev.organizationData,
          structureType: value,
        },
      }));
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (
    section: "personalData" | "businessData" | "organizationData",
    field: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setErrorMessage(null);

    const name = normalizeValue(form.name);
    if (!name) {
      setErrorMessage("Name wajib diisi.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        isClient: contactType === "Client" ? "CLIENT" : "NON_CLIENT",
        contactType: entityType,
        name,
        email: normalizeValue(form.email),
        phoneNumber: normalizeValue(form.phoneNumber),
        address: normalizeValue(form.address),
        additionalInfo: normalizeValue(form.additionalInfo),
        creator: getCreatorValue(),
        personalData: undefined as undefined | {
          citizenship?: string;
          identificationNo?: string;
          office_position?: string;
          gender?: string;
          birthDate?: string;
          religion?: string;
        },
        businessData: undefined as undefined | {
          businessType?: string;
          taxCode?: string;
          commissioners?: string;
          directors?: string;
          shareholders?: string;
          lawyers?: string;
        },
        organizationData: undefined as undefined | {
          structureType?: string;
          taxCode?: string;
          maintainers?: string;
          mentors?: string;
          supervisors?: string;
          members?: string;
          lawyers?: string;
        },
      };

      if (isPersonal) {
        payload.personalData = {
          citizenship: normalizeValue(form.personalData.citizenship),
          identificationNo: normalizeValue(form.personalData.identificationNo),
          office_position: normalizeValue(form.personalData.office_position),
          gender: normalizeValue(form.personalData.gender),
          birthDate: form.personalData.birthDate || undefined,
          religion: normalizeValue(form.personalData.religion),
        };
      } else if (isOrganization) {
        payload.organizationData = {
          structureType:
            normalizeValue(form.organizationData.structureType) ?? entityType,
          taxCode: normalizeValue(form.organizationData.taxCode),
          maintainers: normalizeValue(form.organizationData.maintainers),
          mentors: normalizeValue(form.organizationData.mentors),
          supervisors: normalizeValue(form.organizationData.supervisors),
          members: normalizeValue(form.organizationData.members),
          lawyers: normalizeValue(form.organizationData.lawyers),
        };
      } else {
        payload.businessData = {
          businessType: normalizeValue(form.businessData.businessType),
          taxCode: normalizeValue(form.businessData.taxCode),
          commissioners: normalizeValue(form.businessData.commissioners),
          directors: normalizeValue(form.businessData.directors),
          shareholders: normalizeValue(form.businessData.shareholders),
          lawyers: normalizeValue(form.businessData.lawyers),
        };
      }

      await contactService.create(payload);
      await onCreated();
      onClose();
    } catch (error) {
      setErrorMessage("Gagal menyimpan kontak. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Style helper untuk input agar kodingan lebih bersih
  const inputStyle = "w-full bg-black/20 border-2 border-[#5A7ACD]/20 rounded-2xl px-5 py-3.5 text-sm text-[#5A7ACD] outline-none focus:border-[#5A7ACD] transition-all placeholder:opacity-30";
  const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em] text-[#5A7ACD] ml-2 mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2B2A2A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className=" bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] w-full max-w-2xl rounded-[2.5rem] border border-[#5A7ACD]/30 flex flex-col max-h-[90vh] shadow-[0_35px_60px_-15px_rgba(90,122,205,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-[#5A7ACD]/20 flex justify-between items-center bg-black/10">
          <div className="flex items-center  gap-4">
            <div className="p-3 bg-[#5A7ACD] rounded-2xl text-[#F5F2F2]">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-black  uppercase tracking-tight">Add Contact</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#FEB05D] hover:text-[#2B2A2A] rounded-full transition-all">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Top Section: Photo & Client Toggle */}
          <section className="flex flex-col items-center gap-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[3rem] border-4 border-[#5A7ACD]/30 bg-black/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#FEB05D]">
                <Users size={80} className="text-[#5A7ACD]/20 group-hover:text-[#FEB05D]/50" />
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-[#5A7ACD] hover:bg-[#FEB05D] rounded-2xl text-white shadow-xl border-4 border-[#2B2A2A] transition-all">
                <Camera size={20} />
              </button>
            </div>
            
            <div className="w-full space-y-6">
              {/* Toggle Client / Non Client */}
              <div className="flex bg-black/20 p-2 rounded-2xl border border-[#5A7ACD]/20 w-fit mx-auto">
                {['Client', 'Non Client'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setContactType(type)}
                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                      contactType === type 
                      ? 'bg-[#5A7ACD] text-[#F5F2F2] shadow-lg' 
                      : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              {/* Entity Type Dropdown */}
              <div className="space-y-3">
                <label className={labelStyle}>Contact Type</label>
                <div className="relative">
                  <select 
                    value={entityType}
                    onChange={(e) => handleEntityChange(e.target.value)}
                    className="w-full bg-black/20 border-2 border-[#5A7ACD]/20 rounded-2xl px-5 py-4 text-sm appearance-none outline-none focus:border-[#5A7ACD] transition-all"
                  >
                    {ENTITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#5A7ACD]" size={20} />
                </div>
              </div>
            </div>
          </section>

          {/* Dinamis Form Berdasarkan Entity Type */}
          <section className="space-y-6 pt-8 border-t border-[#5A7ACD]/10">
            <h3 className="font-black text-lg uppercase tracking-tight border-l-4 border-[#5A7ACD] pl-4">Contact Detail</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelStyle}>Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputStyle}
                />
              </div>

              {entityType === 'Personal' ? (
                /* VIEW PERSONAL */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Citizenship</label>
                        <input
                          type="text"
                          placeholder="Citizenship"
                          value={form.personalData.citizenship}
                          onChange={(e) =>
                            updateNestedField("personalData", "citizenship", e.target.value)
                          }
                          className={inputStyle}
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>ID Number</label>
                        <input
                          type="text"
                          placeholder="Identification Number"
                          value={form.personalData.identificationNo}
                          onChange={(e) =>
                            updateNestedField(
                              "personalData",
                              "identificationNo",
                              e.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Position</label>
                    <input
                      type="text"
                      placeholder="Position"
                      value={form.personalData.office_position}
                      onChange={(e) =>
                        updateNestedField("personalData", "office_position", e.target.value)
                      }
                      className={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className={inputStyle}
                      value={form.personalData.gender}
                      onChange={(e) =>
                        updateNestedField("personalData", "gender", e.target.value)
                      }
                    >
                      <option value="">Gender</option>
                      {GENDER_OPTIONS.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={form.personalData.birthDate}
                      onChange={(e) =>
                        updateNestedField("personalData", "birthDate", e.target.value)
                      }
                      className={inputStyle}
                    />
                  </div>
                  <select
                    className={inputStyle}
                    value={form.personalData.religion}
                    onChange={(e) =>
                      updateNestedField("personalData", "religion", e.target.value)
                    }
                  >
                    <option value="">Religion</option>
                    {RELIGION_OPTIONS.map((religion) => (
                      <option key={religion} value={religion}>
                        {religion}
                      </option>
                    ))}
                  </select>
                  
                  <div className="mt-4">
                    <label className={labelStyle}>Personal Document</label>
                    <div className="group border-2 border-dashed border-[#5A7ACD]/30 hover:border-[#FEB05D] rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-black/5">
                      <Upload className="text-[#5A7ACD] group-hover:text-[#FEB05D]" size={32} />
                      <p className="text-sm font-bold opacity-60">Select or drag and drop your files here</p>
                      <p className="text-[10px] opacity-40">(Up to 5GB)</p>
                    </div>
                  </div>
                </>
              ) : (
                isOrganization ? (
                  /* VIEW ORGANIZATION */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Structure Type"
                        value={form.organizationData.structureType}
                        onChange={(e) =>
                          updateNestedField(
                            "organizationData",
                            "structureType",
                            e.target.value,
                          )
                        }
                        className={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Tax Code"
                        value={form.organizationData.taxCode}
                        onChange={(e) =>
                          updateNestedField("organizationData", "taxCode", e.target.value)
                        }
                        className={inputStyle}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Maintainers"
                      value={form.organizationData.maintainers}
                      onChange={(e) =>
                        updateNestedField("organizationData", "maintainers", e.target.value)
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Mentors"
                      value={form.organizationData.mentors}
                      onChange={(e) =>
                        updateNestedField("organizationData", "mentors", e.target.value)
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Supervisors"
                      value={form.organizationData.supervisors}
                      onChange={(e) =>
                        updateNestedField("organizationData", "supervisors", e.target.value)
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Members"
                      value={form.organizationData.members}
                      onChange={(e) =>
                        updateNestedField("organizationData", "members", e.target.value)
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Lawyers"
                      value={form.organizationData.lawyers}
                      onChange={(e) =>
                        updateNestedField("organizationData", "lawyers", e.target.value)
                      }
                      className={inputStyle}
                    />

                    <div className="mt-4">
                      <label className={labelStyle}>Organization Document</label>
                      <div className="group border-2 border-dashed border-[#5A7ACD]/30 hover:border-[#FEB05D] rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-black/5">
                        <Upload className="text-[#5A7ACD] group-hover:text-[#FEB05D]" size={32} />
                        <p className="text-sm font-bold opacity-60">Select or drag and drop your files here</p>
                        <p className="text-[10px] opacity-40">(Up to 5GB)</p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* VIEW COMPANY */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Business Type"
                        value={form.businessData.businessType}
                        onChange={(e) =>
                          updateNestedField("businessData", "businessType", e.target.value)
                        }
                        className={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Tax Code"
                        value={form.businessData.taxCode}
                        onChange={(e) =>
                          updateNestedField("businessData", "taxCode", e.target.value)
                        }
                        className={inputStyle}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Commissioners"
                      value={form.businessData.commissioners}
                      onChange={(e) =>
                        updateNestedField(
                          "businessData",
                          "commissioners",
                          e.target.value,
                        )
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Directors"
                      value={form.businessData.directors}
                      onChange={(e) =>
                        updateNestedField("businessData", "directors", e.target.value)
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Shareholders"
                      value={form.businessData.shareholders}
                      onChange={(e) =>
                        updateNestedField("businessData", "shareholders", e.target.value)
                      }
                      className={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Lawyers"
                      value={form.businessData.lawyers}
                      onChange={(e) =>
                        updateNestedField("businessData", "lawyers", e.target.value)
                      }
                      className={inputStyle}
                    />

                    <div className="mt-4">
                      <label className={labelStyle}>Company Document</label>
                      <div className="group border-2 border-dashed border-[#5A7ACD]/30 hover:border-[#FEB05D] rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-black/5">
                        <Upload className="text-[#5A7ACD] group-hover:text-[#FEB05D]" size={32} />
                        <p className="text-sm font-bold opacity-60">Select or drag and drop your files here</p>
                        <p className="text-[10px] opacity-40">(Up to 5GB)</p>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </section>

          {/* Section: Contact Info, Address, dsb (Tetap Sama) */}
          <section className="space-y-6 pt-8 border-t border-[#5A7ACD]/10">
            <h3 className="font-black text-lg uppercase tracking-tight border-l-4 border-[#5A7ACD] pl-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Phone Number</label>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-8 border-t border-[#5A7ACD]/10">
            <h3 className="font-black text-lg uppercase tracking-tight border-l-4 border-[#5A7ACD] pl-4">
              Address Detail
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelStyle}>Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-8 border-t border-[#5A7ACD]/10">
            <h3 className="font-black text-lg uppercase tracking-tight border-l-4 border-[#5A7ACD] pl-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelStyle}>Notes</label>
                <textarea
                  placeholder="Additional info"
                  value={form.additionalInfo}
                  onChange={(e) => updateField("additionalInfo", e.target.value)}
                  className={`${inputStyle} min-h-[120px]`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#5A7ACD]/20 bg-black/20 flex flex-col gap-4">
          {errorMessage && (
            <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
          )}
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl text-sm font-black uppercase border-2 border-[#5A7ACD] text-[#5A7ACD] hover:bg-[#5A7ACD] hover:text-[#F5F2F2] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] bg-[#5A7ACD] hover:bg-[#FEB05D] py-4 rounded-2xl text-sm font-black uppercase text-[#F5F2F2] shadow-xl shadow-[#5A7ACD]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
