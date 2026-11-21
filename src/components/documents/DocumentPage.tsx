"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  FileText,
  Folder as FolderIcon,
  ChevronDown,
  Trash2,
  Pencil,
  Calendar,
  Upload,
  X,
  Home,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  documentService,
  DocumentBreadcrumbItem,
  DocumentItem,
  resolveDocumentFileUrl,
} from "@/services/documents";
import { contactService, Contact } from "@/services/contacts";
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

const initialFormState = {
  contactId: "",
  matterId: "",
  name: "",
  physicalLocation: "",
  hyperlink: "",
  description: "",
};

const normalizeValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sortDocuments = (items: DocumentItem[]) =>
  [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "FOLDER" ? -1 : 1;
    }

    return a.name.localeCompare(b.name, "id", { sensitivity: "base" });
  });

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"File" | "Folder">("File");
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<DocumentBreadcrumbItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<DocumentItem | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);

  const resetForm = (withCurrentContext = false) => {
    setForm({
      ...initialFormState,
      contactId: withCurrentContext ? currentFolder?.contactId ?? "" : "",
      matterId: withCurrentContext ? currentFolder?.matterId ?? "" : "",
    });
    setFormError(null);
    setSelectedFileName(null);
    setSelectedFile(null);
  };

  const handleOpenModal = (type: "File" | "Folder") => {
    setEditingDocument(null);
    setModalType(type);
    setIsModalOpen(true);
    setIsDropdownOpen(false);
    resetForm(true);
  };

  const handleCloseModal = () => {
    setEditingDocument(null);
    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (item: DocumentItem) => {
    setEditingDocument(item);
    setModalType(item.type === "FILE" ? "File" : "Folder");
    setIsModalOpen(true);
    setIsDropdownOpen(false);
    setFormError(null);
    setSelectedFile(null);
    setSelectedFileName(null);
    setForm({
      contactId: item.contactId ?? "",
      matterId: item.matterId ?? "",
      name: item.name ?? "",
      physicalLocation: item.physicalLocation ?? "",
      hyperlink: item.hyperlink ?? "",
      description: item.description ?? "",
    });
  };

  const openFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSearch("");
    setActiveFilter("All");
  };

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    const loadFolder = async () => {
      try {
        const childrenPromise = documentService.listByParent(currentFolderId);
        const breadcrumbPromise = currentFolderId
          ? documentService.getBreadcrumb(currentFolderId)
          : Promise.resolve<DocumentBreadcrumbItem[]>([]);
        const folderPromise = currentFolderId
          ? documentService.getById(currentFolderId)
          : Promise.resolve<DocumentItem | null>(null);

        const [children, breadcrumbData, folderData] = await Promise.all([
          childrenPromise,
          breadcrumbPromise,
          folderPromise,
        ]);

        if (!isActive) return;

        setDocuments(sortDocuments(children));
        setBreadcrumb(breadcrumbData);
        setCurrentFolder(folderData);
      } catch {
        if (isActive) {
          setError("Gagal memuat dokumen. Coba lagi.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadFolder();

    return () => {
      isActive = false;
    };
  }, [currentFolderId]);

  useEffect(() => {
    let isActive = true;
    setIsReferenceLoading(true);
    setReferenceError(null);

    Promise.all([contactService.list(), matterService.list()])
      .then(([contactData, matterData]) => {
        if (!isActive) return;
        setContacts(contactData);
        setMatters(matterData);
      })
      .catch(() => {
        if (isActive) {
          setReferenceError("Gagal memuat kontak atau matter.");
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

  const availableMatters = useMemo(() => {
    if (!form.contactId) return matters;
    return matters.filter((matter) => matter.clientId === form.contactId);
  }, [form.contactId, matters]);

  useEffect(() => {
    if (!form.matterId) return;
    const isValid = availableMatters.some((matter) => matter.id === form.matterId);
    if (!isValid) {
      setForm((prev) => ({ ...prev, matterId: "" }));
    }
  }, [availableMatters, form.matterId]);

  const handleSaveDocument = async () => {
    setFormError(null);

    const name = normalizeValue(form.name);
    if (!name) {
      setFormError("Nama dokumen wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingDocument) {
        const updated = await documentService.update(editingDocument.id, {
          name,
          contactId: normalizeValue(form.contactId),
          matterId: normalizeValue(form.matterId),
          physicalLocation: normalizeValue(form.physicalLocation),
          hyperlink: normalizeValue(form.hyperlink),
          description: normalizeValue(form.description),
        });

        setDocuments((prev) =>
          sortDocuments(prev.map((item) => (item.id === updated.id ? updated : item))),
        );
      } else {
        const created = await documentService.create({
          type: modalType === "File" ? "FILE" : "FOLDER",
          name,
          parentId: currentFolderId,
          contactId: normalizeValue(form.contactId),
          matterId: normalizeValue(form.matterId),
          physicalLocation: normalizeValue(form.physicalLocation),
          hyperlink: normalizeValue(form.hyperlink),
          description: normalizeValue(form.description),
          file: modalType === "File" ? selectedFile : null,
        });

        setDocuments((prev) => sortDocuments([created, ...prev]));
      }

      setEditingDocument(null);
      setIsModalOpen(false);
      resetForm();
    } catch {
      setFormError(
        editingDocument
          ? "Gagal memperbarui dokumen. Coba lagi."
          : "Gagal menyimpan dokumen. Coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async (item: DocumentItem) => {
    const confirmed = window.confirm(
      `Pindahkan "${item.name}" ke Trash?`,
    );
    if (!confirmed) return;

    try {
      await documentService.remove(item.id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== item.id));
    } catch {
      window.alert("Gagal memindahkan dokumen ke trash.");
    }
  };

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "File" && doc.type === "FILE") ||
        (activeFilter === "Folder" && doc.type === "FOLDER");

      const matchesSearch = !query
        ? true
        : [
            doc.name,
            doc.hyperlink,
            doc.physicalLocation,
            doc.description,
            doc.contact?.name,
            doc.matter?.caseArea,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, documents, search]);

  const emptyMessage = currentFolderId
    ? "Folder ini masih kosong."
    : "Belum ada dokumen di root.";

  const openParentFolder = () => {
    setCurrentFolderId(currentFolder?.parentId ?? null);
    setSearch("");
    setActiveFilter("All");
  };

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5A7ACD] rounded-2xl text-[#F5F2F2] shadow-lg shadow-[#5A7ACD]/20">
              <FolderIcon size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                Documents
              </h1>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">
                Arsip Digital & Berkas Perkara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/documents/trash"
              className="opacity-50 hover:opacity-100 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
            >
              <Trash2 size={16} /> Trash
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-6 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#5A7ACD]/20 active:scale-95"
              >
                <Plus size={18} /> Add document{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => handleOpenModal("File")}
                    className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest hover:bg-[#5A7ACD] hover:text-white transition-colors border-b border-[#2B2A2A]/5"
                  >
                    Add File
                  </button>
                  <button
                    onClick={() => handleOpenModal("Folder")}
                    className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest hover:bg-[#5A7ACD] hover:text-white transition-colors"
                  >
                    Add Folder
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex flex-wrap items-center gap-3 mb-8 shadow-sm">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#F5F2F2] dark:bg-[#2B2A2A] hover:bg-[#5A7ACD] hover:text-white transition-colors flex items-center gap-2"
          >
            <Home size={14} /> Root
          </button>

          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <React.Fragment key={item.id}>
                <ChevronRight size={14} className="opacity-40" />
                <button
                  onClick={() => setCurrentFolderId(item.id)}
                  disabled={isLast}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isLast
                      ? "bg-[#5A7ACD] text-white cursor-default"
                      : "bg-[#F5F2F2] dark:bg-[#2B2A2A] hover:bg-[#5A7ACD] hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            );
          })}

          {currentFolderId && (
            <button
              onClick={openParentFolder}
              className="ml-auto px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#F5F2F2] dark:bg-[#2B2A2A] hover:bg-[#5A7ACD] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Up
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex flex-wrap items-center gap-6 mb-8 shadow-sm">
          <div className="relative flex-grow max-w-md group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari berkas perkara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        <div className="overflow-x-auto bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[2.5rem] shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F5F2F2] dark:bg-[#2B2A2A] opacity-50 text-[10px] font-black uppercase tracking-widest border-b border-[#2B2A2A]/5">
              <tr>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5 text-[#5A7ACD]">Name ↓</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Matter</th>
                <th className="px-8 py-5">Hyperlink</th>
                <th className="px-8 py-5">Last Edit</th>
                <th className="px-8 py-5 text-right">Upload Date</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold divide-y divide-[#2B2A2A]/5 dark:divide-[#F5F2F2]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-8 py-10 text-center text-sm text-slate-400">
                    Loading documents...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-8 py-10 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FolderIcon size={40} className="text-[#5A7ACD]" />
                      <p className="text-sm font-bold text-[#2B2A2A] dark:text-[#F5F2F2]">
                        {emptyMessage}
                      </p>
                      <p className="text-xs opacity-70">
                        Klik Add Document untuk menambahkan file atau folder baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((item) => (
                  <tr key={item.id} className="hover:bg-[#5A7ACD]/5 transition-colors group">
                    <td className="px-8 py-6">
                      {item.type === "FOLDER" ? (
                        <FolderIcon size={22} className="text-[#5A7ACD]" />
                      ) : (
                        <FileText size={22} className="opacity-40" />
                      )}
                    </td>
                    <td className="px-8 py-6 text-[#2B2A2A] dark:text-[#F5F2F2] font-black uppercase tracking-tight group-hover:text-[#5A7ACD]">
                      {item.type === "FOLDER" ? (
                        <button
                          onClick={() => openFolder(item.id)}
                          className="hover:underline underline-offset-4 text-left"
                        >
                          {item.name}
                        </button>
                      ) : resolveDocumentFileUrl(item.fileUrl) ? (
                        <a
                          href={resolveDocumentFileUrl(item.fileUrl) ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline underline-offset-4"
                        >
                          {item.name}
                        </a>
                      ) : item.hyperlink ? (
                        <a
                          href={item.hyperlink}
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
                    <td className="px-8 py-6 opacity-50">
                      {item.hyperlink ? (
                        <a
                          href={item.hyperlink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline underline-offset-4"
                        >
                          {item.hyperlink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-8 py-6 opacity-60 font-mono text-xs">
                      {formatDate(item.lastEdit)}
                    </td>
                    <td className="px-8 py-6 opacity-60 font-mono text-xs text-right">
                      {formatDate(item.uploadDate)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-lg bg-[#5A7ACD]/10 text-[#5A7ACD] hover:bg-[#5A7ACD] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(item)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0E0E0E]/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#5A7ACD]">
                  {modalType === "File" ? (
                    <FileText size={26} />
                  ) : (
                    <FolderIcon size={26} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-[#5A7ACD]">
                    {editingDocument ? `Edit ${modalType}` : `Add ${modalType}`}
                  </h2>
                  {currentFolder && !editingDocument && (
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">
                      Folder: {currentFolder.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="relative">
                <select
                  value={form.contactId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, contactId: e.target.value }))
                  }
                  disabled={isReferenceLoading}
                  className="w-full rounded-2xl bg-white/10 dark:bg-dark/10 text-black dark:text-white border border-black dark:border-white px-5 py-4 text-sm appearance-none outline-none focus:border-[#FEB05D] focus:ring-2 focus:ring-[#FEB05D]/20 transition-all disabled:opacity-60"
                >
                  <option value="">
                    {isReferenceLoading ? "Loading contact..." : "Contact"}
                  </option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50"
                  size={18}
                />
              </div>

              <div className="relative">
                <select
                  value={form.matterId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, matterId: e.target.value }))
                  }
                  disabled={isReferenceLoading}
                  className="w-full rounded-2xl bg-white/10 dark:bg-dark/10 text-black dark:text-white border border-black dark:border-white px-5 py-4 text-sm appearance-none outline-none focus:border-[#FEB05D] focus:ring-2 focus:ring-[#FEB05D]/20 transition-all disabled:opacity-60"
                >
                  <option value="">
                    {isReferenceLoading ? "Loading matter..." : "Matter"}
                  </option>
                  {availableMatters.length === 0 && !isReferenceLoading ? (
                    <option value="" disabled>
                      {form.contactId
                        ? "Matter untuk kontak ini tidak ditemukan"
                        : "Belum ada matter"}
                    </option>
                  ) : (
                    availableMatters.map((matter) => (
                      <option key={matter.id} value={matter.id}>
                        {matter.caseArea}
                        {matter.caseType ? ` - ${matter.caseType}` : ""}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50"
                  size={18}
                />
              </div>

              <input
                type="text"
                placeholder={modalType === "File" ? "File Name" : "Folder Name"}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-2xl bg-white/10 dark:bg-dark/10 text-black dark:text-white border border-black dark:border-white px-5 py-4 text-sm placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus:border-[#FEB05D] focus:ring-2 focus:ring-[#FEB05D]/20 transition-all"
              />

              <input
                type="text"
                placeholder="Physical Location"
                value={form.physicalLocation}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, physicalLocation: e.target.value }))
                }
                className="w-full rounded-2xl bg-white/10 dark:bg-dark/10 text-black dark:text-white border border-black dark:border-white px-5 py-4 text-sm placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus:border-[#FEB05D] focus:ring-2 focus:ring-[#FEB05D]/20 transition-all"
              />

              <input
                type="text"
                placeholder="Hyperlink"
                value={form.hyperlink}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hyperlink: e.target.value }))
                }
                className="w-full rounded-2xl bg-white/10 dark:bg-dark/10 text-black dark:text-white border border-black dark:border-white px-5 py-4 text-sm placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus:border-[#FEB05D] focus:ring-2 focus:ring-[#FEB05D]/20 transition-all"
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full min-h-[140px] rounded-2xl bg-white/10 dark:bg-dark/10 text-black dark:text-white border border-black dark:border-white px-5 py-4 text-sm placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus:border-[#FEB05D] focus:ring-2 focus:ring-[#FEB05D]/20 transition-all"
              />

              {modalType === "File" && !editingDocument && (
                <div className="pt-2 space-y-3">
                  <label className="text-sm font-semibold text-black dark:text-white">
                    Upload File
                  </label>
                  <label
                    htmlFor="file-upload-input"
                    className="border-2 border-dashed bg-white/10 dark:bg-dark/10 rounded-[2rem] p-8 flex flex-col items-center justify-center border-black dark:border-white hover:border-[#FEB05D] transition-all cursor-pointer"
                  >
                    <div className="mb-3 text-black dark:text-white">
                      <Upload size={28} />
                    </div>
                    <p className="text-sm text-black dark:text-white">
                      Select or drag and drop your files here
                    </p>
                    <p className="text-xs text-black dark:text-white">(Up to 5GB)</p>
                    {selectedFileName && (
                      <p className="text-xs text-black dark:text-white mt-2">
                        {selectedFileName}
                      </p>
                    )}
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const selected = event.target.files?.[0];
                        const fileName = selected?.name ?? null;
                        setSelectedFileName(fileName);
                        setSelectedFile(selected ?? null);

                        if (fileName && !form.name.trim()) {
                          setForm((prev) => ({ ...prev, name: fileName }));
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {referenceError && <p className="text-xs text-red-400">{referenceError}</p>}
              {formError && <p className="text-xs text-red-400">{formError}</p>}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end items-center gap-6">
              <button
                onClick={handleCloseModal}
                className="text-sm font-semibold text-black dark:text-white hover:text-[#FEB05D] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocument}
                disabled={isSaving}
                className="px-10 py-3 bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#0E0E0E] font-black rounded-2xl transition-all text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#4DB6AC]/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? editingDocument
                    ? "Updating..."
                    : "Saving..."
                  : editingDocument
                    ? "Update"
                    : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
