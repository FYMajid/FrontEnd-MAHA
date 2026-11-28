"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Loader2,
  Plus,
  Scale,
  Trash2,
  X,
} from "lucide-react";
import { matterService, MatterItem, MatterStatus } from "@/services/matters";
import { contactService, Contact } from "@/services/contacts";
import { userService } from "@/services/user";
import type { AuthUser } from "@/services/auth";

export const CASE_AREA_OPTIONS = [
  "Civil",
  "Corporate",
  "Criminal",
  "Family",
  "Labor",
  "Intellectual Property",
];

export const CASE_TYPE_OPTIONS = [
  "Traffic",
  "Contract Review",
  "Litigation",
  "Compliance",
  "Property",
  "Employment",
];

export const DISPUTE_OPTIONS = [
  "Litigation",
  "Non Litigation",
  "Arbitration",
  "Mediation",
];

export const PAYMENT_METHOD_OPTIONS = [
  "Hourly",
  "Fixed",
  "Retainer",
  "Pro Bono",
  "Other",
];

export type AddressItem = {
  id: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
  isPrimary: boolean;
};

export type RelatedContactItem = {
  id: string;
  contactId: string;
  description: string;
};

export type PaymentMethodItem = {
  id: string;
  method: string;
};

export type AdditionalInfoItem = {
  id: string;
  question: string;
  answer: string;
};

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

const fieldBase =
  "w-full rounded-xl border border-[#2B2A2A]/15 bg-white px-4 py-3 text-sm text-[#2B2A2A] outline-none transition-colors " +
  "placeholder:text-[#2B2A2A]/50 focus:border-[#5A7ACD] focus:ring-2 focus:ring-[#5A7ACD]/20 " +
  "dark:border-white/15 dark:bg-[#1E1E1E] dark:text-[#F5F2F2] dark:placeholder:text-white/40 " +
  "dark:focus:border-[#5A7ACD] dark:focus:ring-[#5A7ACD]/25";

const selectClassName = `${fieldBase} appearance-none pr-11 cursor-pointer`;
const inputClassName = `${fieldBase} h-11`;
const textareaClassName = `${fieldBase} min-h-24 resize-y`;

const labelStyle =
  "block text-xs font-semibold uppercase tracking-wider text-[#2B2A2A]/75 dark:text-white/80 mb-2";

const sectionTitleStyle =
  "text-xs font-black uppercase tracking-widest text-[#5A7ACD] pb-1";

interface AddMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newMatter: MatterItem) => void;
  initialContacts?: Contact[];
  initialCurrentUser?: AuthUser | null;
}

export default function AddMatterModal({
  isOpen,
  onClose,
  onCreated,
  initialContacts,
  initialCurrentUser,
}: AddMatterModalProps) {
  const dialogId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<Contact[]>(initialContacts ?? []);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    initialCurrentUser ?? null,
  );
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

  // Sync initial props
  useEffect(() => {
    if (initialContacts && initialContacts.length > 0) {
      setContacts(initialContacts);
    }
  }, [initialContacts]);

  useEffect(() => {
    if (initialCurrentUser) {
      setCurrentUser(initialCurrentUser);
      setForm((prev) =>
        prev.responsibleAttorneyId
          ? prev
          : { ...prev, responsibleAttorneyId: initialCurrentUser.id },
      );
    }
  }, [initialCurrentUser]);

  // Fetch references if not provided
  useEffect(() => {
    if (!isOpen) return;
    if (contacts.length > 0 && currentUser) return;

    let isActive = true;
    setIsReferenceLoading(true);
    setReferenceError(null);

    Promise.allSettled([
      contacts.length === 0 ? contactService.list() : Promise.resolve(contacts),
      !currentUser ? userService.getMe() : Promise.resolve({ user: currentUser }),
    ])
      .then((results) => {
        if (!isActive) return;
        const [contactsResult, userResult] = results;

        if (contactsResult.status === "fulfilled") {
          setContacts(contactsResult.value);
        } else {
          setReferenceError("Gagal memuat kontak client.");
        }

        if (userResult.status === "fulfilled") {
          const user = userResult.value.user;
          setCurrentUser(user);
          setForm((prev) =>
            prev.responsibleAttorneyId
              ? prev
              : { ...prev, responsibleAttorneyId: user.id },
          );
        }
      })
      .finally(() => {
        if (isActive) setIsReferenceLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, contacts.length, currentUser]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap
  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const clientOptions = useMemo(
    () => contacts.filter((contact) => contact.isClient === "CLIENT"),
    [contacts],
  );

  const resetState = () => {
    setForm({
      ...initialFormState,
      responsibleAttorneyId: currentUser?.id ?? "",
    });
    setFormError(null);
    setAddresses([]);
    setRelatedContacts([]);
    setPaymentMethods([]);
    setMaximumBudget("");
    setAdditionalInfos([]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

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
        parts.push(`Q${index + 1}: ${question ?? "-"} | A: ${answer ?? "-"}`);
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
    setPaymentMethods((prev) => [...prev, { id: createId(), method: "" }]);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const clientId = normalizeValue(form.clientId);
    const responsibleAttorneyId = normalizeValue(form.responsibleAttorneyId);
    const caseArea = normalizeValue(form.caseArea);
    const caseType = normalizeValue(form.caseType);
    const disputeResolution = normalizeValue(form.disputeResolution);

    if (!clientId) {
      setFormError("Client wajib dipilih.");
      return;
    }
    if (!responsibleAttorneyId) {
      setFormError("Responsible attorney wajib dipilih.");
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

      onCreated(enhancedMatter);
      handleClose();
    } catch {
      setFormError("Gagal menyimpan matter ke server. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${dialogId}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2B2A2A]/75 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        onKeyDown={handlePanelKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#F5F2F2] dark:bg-[#242323] text-[#2B2A2A] dark:text-[#F5F2F2] shadow-2xl border border-[#2B2A2A]/10 dark:border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2B2A2A]/10 dark:border-white/10 bg-white/70 dark:bg-[#1E1E1E]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#5A7ACD]/10 text-[#5A7ACD]">
              <Scale size={20} aria-hidden="true" />
            </div>
            <div>
              <h2
                id={`${dialogId}-title`}
                className="text-lg font-bold tracking-tight text-[#2B2A2A] dark:text-[#F5F2F2]"
              >
                Add New Matter
              </h2>
              <p className="text-xs text-[#2B2A2A]/60 dark:text-white/60">
                Lengkapi informasi perkara hukum baru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[#2B2A2A]/60 dark:text-white/60 hover:text-[#2B2A2A] dark:hover:text-white hover:bg-[#2B2A2A]/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
          {referenceError && (
            <div className="p-3.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {referenceError}
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {formError}
            </div>
          )}

          {/* Section 1: Matter Information */}
          <section className="space-y-4">
            <h3 className={sectionTitleStyle}>1. Matter Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${dialogId}-client`} className={labelStyle}>
                  Client <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id={`${dialogId}-client`}
                    value={form.clientId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, clientId: e.target.value }))
                    }
                    disabled={isReferenceLoading}
                    className={selectClassName}
                    required
                  >
                    <option value="">
                      {isReferenceLoading ? "Memuat client..." : "Pilih Client"}
                    </option>
                    {clientOptions.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${dialogId}-attorney`} className={labelStyle}>
                  Responsible Attorney <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id={`${dialogId}-attorney`}
                    value={form.responsibleAttorneyId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        responsibleAttorneyId: e.target.value,
                      }))
                    }
                    disabled={!currentUser}
                    className={selectClassName}
                    required
                  >
                    <option value="">
                      {currentUser ? "Pilih Attorney" : "Login required"}
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
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor={`${dialogId}-members`} className={labelStyle}>
                Team Members
              </label>
              <input
                id={`${dialogId}-members`}
                type="text"
                placeholder="Nama rekan atau tim yang terlibat"
                value={form.members}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, members: e.target.value }))
                }
                className={inputClassName}
              />
            </div>
          </section>

          <hr className="border-[#2B2A2A]/10 dark:border-white/10" />

          {/* Section 2: Classification */}
          <section className="space-y-4">
            <h3 className={sectionTitleStyle}>2. Matter Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor={`${dialogId}-case-area`} className={labelStyle}>
                  Case Area <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id={`${dialogId}-case-area`}
                    value={form.caseArea}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, caseArea: e.target.value }))
                    }
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Case Area</option>
                    {CASE_AREA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${dialogId}-case-type`} className={labelStyle}>
                  Case Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id={`${dialogId}-case-type`}
                    value={form.caseType}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, caseType: e.target.value }))
                    }
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Case Type</option>
                    {CASE_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${dialogId}-dispute-resolution`}
                  className={labelStyle}
                >
                  Dispute Resolution <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id={`${dialogId}-dispute-resolution`}
                    value={form.disputeResolution}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        disputeResolution: e.target.value,
                      }))
                    }
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Dispute</option>
                    {DISPUTE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor={`${dialogId}-description`} className={labelStyle}>
                Case Description
              </label>
              <textarea
                id={`${dialogId}-description`}
                placeholder="Rincian deskripsi perkara atau latar belakang kasus"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={textareaClassName}
              />
            </div>
          </section>

          <hr className="border-[#2B2A2A]/10 dark:border-white/10" />

          {/* Section 3: Timeline & Status */}
          <section className="space-y-4">
            <h3 className={sectionTitleStyle}>3. Status & Timeline</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor={`${dialogId}-status`} className={labelStyle}>
                  Status
                </label>
                <div className="relative">
                  <select
                    id={`${dialogId}-status`}
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as MatterStatus,
                      }))
                    }
                    className={selectClassName}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${dialogId}-start-date`} className={labelStyle}>
                  Start Date
                </label>
                <div className="relative">
                  <input
                    id={`${dialogId}-start-date`}
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className={inputClassName}
                  />
                  <Calendar
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/40"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${dialogId}-pending-date`} className={labelStyle}>
                  Pending Date
                </label>
                <div className="relative">
                  <input
                    id={`${dialogId}-pending-date`}
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
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/40"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${dialogId}-close-date`} className={labelStyle}>
                  Close Date
                </label>
                <div className="relative">
                  <input
                    id={`${dialogId}-close-date`}
                    type="date"
                    value={form.closeDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, closeDate: e.target.value }))
                    }
                    className={inputClassName}
                  />
                  <Calendar
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/40 dark:text-white/40"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-[#2B2A2A]/10 dark:border-white/10" />

          {/* Section 4: Location Addresses */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={sectionTitleStyle}>4. Location & Addresses</h3>
              <button
                type="button"
                onClick={addAddress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5A7ACD]/10 text-[#5A7ACD] hover:bg-[#5A7ACD]/20 transition-colors cursor-pointer"
              >
                <Plus size={14} aria-hidden="true" /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-xs text-[#2B2A2A]/60 dark:text-white/60 py-2">
                Belum ada alamat khusus yang ditambahkan untuk perkara ini.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/60 dark:bg-[#1A1A1A]/80 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5A7ACD]">
                        Alamat #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAddress(item.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        aria-label={`Hapus alamat ${index + 1}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`${dialogId}-addr-str-${item.id}`}
                        className={labelStyle}
                      >
                        Alamat Lengkap
                      </label>
                      <input
                        id={`${dialogId}-addr-str-${item.id}`}
                        type="text"
                        placeholder="Nama jalan, gedung, nomor"
                        value={item.address}
                        onChange={(e) =>
                          updateAddress(item.id, "address", e.target.value)
                        }
                        className={inputClassName}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor={`${dialogId}-addr-prov-${item.id}`}
                          className={labelStyle}
                        >
                          Provinsi
                        </label>
                        <input
                          id={`${dialogId}-addr-prov-${item.id}`}
                          type="text"
                          placeholder="Provinsi"
                          value={item.province}
                          onChange={(e) =>
                            updateAddress(item.id, "province", e.target.value)
                          }
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`${dialogId}-addr-city-${item.id}`}
                          className={labelStyle}
                        >
                          Kota
                        </label>
                        <input
                          id={`${dialogId}-addr-city-${item.id}`}
                          type="text"
                          placeholder="Kota / Kabupaten"
                          value={item.city}
                          onChange={(e) =>
                            updateAddress(item.id, "city", e.target.value)
                          }
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`${dialogId}-addr-zip-${item.id}`}
                          className={labelStyle}
                        >
                          Kode Pos
                        </label>
                        <input
                          id={`${dialogId}-addr-zip-${item.id}`}
                          type="text"
                          placeholder="Kode Pos"
                          value={item.postalCode}
                          onChange={(e) =>
                            updateAddress(item.id, "postalCode", e.target.value)
                          }
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#2B2A2A] dark:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isPrimary}
                          onChange={() => setPrimaryAddress(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#5A7ACD] focus:ring-[#5A7ACD] cursor-pointer"
                        />
                        Jadikan Alamat Utama (Primary)
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <hr className="border-[#2B2A2A]/10 dark:border-white/10" />

          {/* Section 5: Related Contacts */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={sectionTitleStyle}>5. Related Contacts</h3>
              <button
                type="button"
                onClick={addRelatedContact}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5A7ACD]/10 text-[#5A7ACD] hover:bg-[#5A7ACD]/20 transition-colors cursor-pointer"
              >
                <Plus size={14} aria-hidden="true" /> Add Contact
              </button>
            </div>

            {relatedContacts.length === 0 ? (
              <p className="text-xs text-[#2B2A2A]/60 dark:text-white/60 py-2">
                Belum ada kontak pihak terkait yang ditambahkan.
              </p>
            ) : (
              <div className="space-y-3">
                {relatedContacts.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/60 dark:bg-[#1A1A1A]/80 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5A7ACD]">
                        Kontak Terkait #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRelatedContact(item.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        aria-label={`Hapus kontak terkait ${index + 1}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`${dialogId}-rel-contact-${item.id}`}
                        className={labelStyle}
                      >
                        Pilih Kontak
                      </label>
                      <div className="relative">
                        <select
                          id={`${dialogId}-rel-contact-${item.id}`}
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
                          <option value="">Pilih Kontak Terdaftar</option>
                          {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                              {contact.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                          size={16}
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`${dialogId}-rel-desc-${item.id}`}
                        className={labelStyle}
                      >
                        Keterangan Hubungan
                      </label>
                      <input
                        id={`${dialogId}-rel-desc-${item.id}`}
                        type="text"
                        placeholder="Contoh: Saksi ahli, Lawan perkara, Penjamin"
                        value={item.description}
                        onChange={(e) =>
                          updateRelatedContact(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                        className={inputClassName}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <hr className="border-[#2B2A2A]/10 dark:border-white/10" />

          {/* Section 6: Financial & Payment */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={sectionTitleStyle}>6. Billing & Payment</h3>
              <button
                type="button"
                onClick={addPaymentMethod}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5A7ACD]/10 text-[#5A7ACD] hover:bg-[#5A7ACD]/20 transition-colors cursor-pointer"
              >
                <Plus size={14} aria-hidden="true" /> Add Payment Method
              </button>
            </div>

            <div>
              <label htmlFor={`${dialogId}-budget`} className={labelStyle}>
                Maximum Budget
              </label>
              <input
                id={`${dialogId}-budget`}
                type="text"
                placeholder="Contoh: IDR 50.000.000"
                value={maximumBudget}
                onChange={(e) => setMaximumBudget(e.target.value)}
                className={inputClassName}
              />
            </div>

            {paymentMethods.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/60 dark:bg-[#1A1A1A]/80 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`${dialogId}-pay-${item.id}`}
                    className={labelStyle}
                  >
                    Metode Pembayaran #{index + 1}
                  </label>
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(item.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    aria-label={`Hapus metode pembayaran ${index + 1}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
                <div className="relative">
                  <select
                    id={`${dialogId}-pay-${item.id}`}
                    value={item.method}
                    onChange={(e) => updatePaymentMethod(item.id, e.target.value)}
                    className={selectClassName}
                  >
                    <option value="">Pilih Skema Biaya</option>
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2A2A]/50 dark:text-white/50"
                    size={16}
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </section>

          <hr className="border-[#2B2A2A]/10 dark:border-white/10" />

          {/* Section 7: Additional Info */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={sectionTitleStyle}>7. Additional Notes</h3>
              <button
                type="button"
                onClick={addAdditionalInfo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5A7ACD]/10 text-[#5A7ACD] hover:bg-[#5A7ACD]/20 transition-colors cursor-pointer"
              >
                <Plus size={14} aria-hidden="true" /> Add Note
              </button>
            </div>

            {additionalInfos.length === 0 ? (
              <p className="text-xs text-[#2B2A2A]/60 dark:text-white/60 py-2">
                Belum ada pertanyaan atau catatan tambahan.
              </p>
            ) : (
              <div className="space-y-3">
                {additionalInfos.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#2B2A2A]/10 dark:border-white/10 bg-white/60 dark:bg-[#1A1A1A]/80 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5A7ACD]">
                        Catatan #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAdditionalInfo(item.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        aria-label={`Hapus catatan ${index + 1}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`${dialogId}-q-${item.id}`}
                        className={labelStyle}
                      >
                        Pertanyaan / Topik
                      </label>
                      <input
                        id={`${dialogId}-q-${item.id}`}
                        type="text"
                        placeholder="Topik catatan"
                        value={item.question}
                        onChange={(e) =>
                          updateAdditionalInfo(item.id, "question", e.target.value)
                        }
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${dialogId}-a-${item.id}`}
                        className={labelStyle}
                      >
                        Jawaban / Keterangan
                      </label>
                      <textarea
                        id={`${dialogId}-a-${item.id}`}
                        placeholder="Detail jawaban atau catatan"
                        value={item.answer}
                        onChange={(e) =>
                          updateAdditionalInfo(item.id, "answer", e.target.value)
                        }
                        className={textareaClassName}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer Actions */}
          <div className="sticky -mx-6 flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2B2A2A]/10 dark:border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#2B2A2A]/70 dark:text-white/70 hover:text-[#2B2A2A] dark:hover:text-white hover:bg-[#2B2A2A]/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#5A7ACD] hover:bg-[#4867b5] text-white shadow-md shadow-[#5A7ACD]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Matter"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
