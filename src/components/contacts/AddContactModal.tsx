"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Users, X } from "lucide-react";
import { contactService } from "@/services/contacts";

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

const normalizeValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getCreatorValue = () => {
  if (typeof window === "undefined") return "system";
  return window.localStorage.getItem("userId") || "system";
};

const fieldBase =
  "w-full rounded-xl border border-[#2B2A2A]/10 bg-white px-4 text-sm text-[#2B2A2A] outline-none transition-colors placeholder:text-[#2B2A2A]/70 focus:border-[#5A7ACD] focus:ring-2 focus:ring-[#5A7ACD]/20 dark:border-[#F5F2F2]/10 dark:bg-[#1F1E1E] dark:text-[#F5F2F2] dark:placeholder:text-[#F5F2F2]/60";
const inputStyle = `${fieldBase} h-11`;
const textareaStyle = `${fieldBase} min-h-24 py-3`;
const labelStyle =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A7ACD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F2F2] dark:focus-visible:ring-offset-[#2B2A2A]";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

export default function AddContactModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [contactType, setContactType] = useState("Client");
  const [entityType, setEntityType] = useState("Personal");
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
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
    if (isSaving) return;
    setErrorMessage(null);

    const name = normalizeValue(form.name);
    if (!name) {
      setErrorMessage("Name wajib diisi.");
      return;
    }

    setIsSaving(true);

    try {
      const payload: Parameters<typeof contactService.create>[0] = {
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
    } catch {
      setErrorMessage("Gagal menyimpan kontak. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2B2A2A]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-contact-title"
        onKeyDown={handleKeyDown}
        className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-[#2B2A2A]/10 bg-[#F5F2F2] text-[#2B2A2A] shadow-2xl dark:border-[#F5F2F2]/10 dark:bg-[#2B2A2A] dark:text-[#F5F2F2] sm:max-h-[90vh] sm:rounded-[2rem]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#2B2A2A]/10 px-5 py-5 dark:border-[#F5F2F2]/10 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5A7ACD] text-white">
              <Users size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="add-contact-title" className="truncate text-lg font-bold">
                Add contact
              </h2>
              <p className="truncate text-xs text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
                Create a client or non-client record
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add contact dialog"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2B2A2A]/70 transition-colors hover:bg-[#2B2A2A]/5 hover:text-[#2B2A2A] active:bg-[#2B2A2A]/10 dark:text-[#F5F2F2]/70 dark:hover:bg-[#F5F2F2]/10 dark:hover:text-[#F5F2F2] dark:active:bg-[#F5F2F2]/15 ${focusRing}`}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <div className="space-y-8">
              <section className="space-y-5">
                <div>
                  <span className={labelStyle}>Client status</span>
                  <div
                    role="group"
                    aria-label="Client status"
                    className="mt-1.5 flex w-full rounded-xl border border-[#2B2A2A]/10 bg-white p-1 dark:border-[#F5F2F2]/10 dark:bg-[#1F1E1E] sm:w-fit"
                  >
                    {["Client", "Non Client"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setContactType(type)}
                        aria-pressed={contactType === type}
                        className={`h-11 flex-1 rounded-lg px-5 text-xs font-semibold transition-colors sm:flex-none ${focusRing} ${
                          contactType === type
                            ? "bg-[#4A69BC] text-white shadow-sm active:bg-[#3A569F]"
                            : "text-[#2B2A2A]/70 hover:bg-[#2B2A2A]/5 hover:text-[#2B2A2A] active:bg-[#2B2A2A]/10 dark:text-[#F5F2F2]/70 dark:hover:bg-[#F5F2F2]/10 dark:hover:text-[#F5F2F2] dark:active:bg-[#F5F2F2]/15"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Contact type">
                  <div className="relative">
                    <select
                      value={entityType}
                      onChange={(event) => handleEntityChange(event.target.value)}
                      className={`${inputStyle} appearance-none pr-10`}
                    >
                      {ENTITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2A2A]/70 dark:text-[#F5F2F2]/60"
                    />
                  </div>
                </Field>

                <Field label="Name">
                  <input
                    data-autofocus
                    type="text"
                    placeholder="Enter contact name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={inputStyle}
                  />
                </Field>
              </section>

              <section className="space-y-5 border-t border-[#2B2A2A]/10 pt-6 dark:border-[#F5F2F2]/10">
                <h3 className="text-sm font-bold">
                  {isPersonal
                    ? "Personal details"
                    : isOrganization
                      ? "Organization details"
                      : "Business details"}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {isPersonal ? (
                    <>
                      <Field label="Citizenship">
                        <input
                          type="text"
                          placeholder="Citizenship"
                          value={form.personalData.citizenship}
                          onChange={(event) =>
                            updateNestedField(
                              "personalData",
                              "citizenship",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="ID number">
                        <input
                          type="text"
                          placeholder="Identification number"
                          value={form.personalData.identificationNo}
                          onChange={(event) =>
                            updateNestedField(
                              "personalData",
                              "identificationNo",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Position" className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Office position"
                          value={form.personalData.office_position}
                          onChange={(event) =>
                            updateNestedField(
                              "personalData",
                              "office_position",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Gender">
                        <div className="relative">
                          <select
                            value={form.personalData.gender}
                            onChange={(event) =>
                              updateNestedField(
                                "personalData",
                                "gender",
                                event.target.value,
                              )
                            }
                            className={`${inputStyle} appearance-none pr-10`}
                          >
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.map((gender) => (
                              <option key={gender} value={gender}>
                                {gender}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2A2A]/70 dark:text-[#F5F2F2]/60"
                          />
                        </div>
                      </Field>
                      <Field label="Birth date">
                        <input
                          type="date"
                          value={form.personalData.birthDate}
                          onChange={(event) =>
                            updateNestedField(
                              "personalData",
                              "birthDate",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Religion" className="sm:col-span-2">
                        <div className="relative">
                          <select
                            value={form.personalData.religion}
                            onChange={(event) =>
                              updateNestedField(
                                "personalData",
                                "religion",
                                event.target.value,
                              )
                            }
                            className={`${inputStyle} appearance-none pr-10`}
                          >
                            <option value="">Select religion</option>
                            {RELIGION_OPTIONS.map((religion) => (
                              <option key={religion} value={religion}>
                                {religion}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2A2A]/70 dark:text-[#F5F2F2]/60"
                          />
                        </div>
                      </Field>
                    </>
                  ) : isOrganization ? (
                    <>
                      <Field label="Structure type">
                        <input
                          type="text"
                          placeholder="Structure type"
                          value={form.organizationData.structureType}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "structureType",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Tax code">
                        <input
                          type="text"
                          placeholder="Tax code"
                          value={form.organizationData.taxCode}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "taxCode",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Maintainers">
                        <input
                          type="text"
                          placeholder="Maintainers"
                          value={form.organizationData.maintainers}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "maintainers",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Mentors">
                        <input
                          type="text"
                          placeholder="Mentors"
                          value={form.organizationData.mentors}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "mentors",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Supervisors">
                        <input
                          type="text"
                          placeholder="Supervisors"
                          value={form.organizationData.supervisors}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "supervisors",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Members">
                        <input
                          type="text"
                          placeholder="Members"
                          value={form.organizationData.members}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "members",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Lawyers" className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Lawyers"
                          value={form.organizationData.lawyers}
                          onChange={(event) =>
                            updateNestedField(
                              "organizationData",
                              "lawyers",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Business type">
                        <input
                          type="text"
                          placeholder="Business type"
                          value={form.businessData.businessType}
                          onChange={(event) =>
                            updateNestedField(
                              "businessData",
                              "businessType",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Tax code">
                        <input
                          type="text"
                          placeholder="Tax code"
                          value={form.businessData.taxCode}
                          onChange={(event) =>
                            updateNestedField(
                              "businessData",
                              "taxCode",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Commissioners">
                        <input
                          type="text"
                          placeholder="Commissioners"
                          value={form.businessData.commissioners}
                          onChange={(event) =>
                            updateNestedField(
                              "businessData",
                              "commissioners",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Directors">
                        <input
                          type="text"
                          placeholder="Directors"
                          value={form.businessData.directors}
                          onChange={(event) =>
                            updateNestedField(
                              "businessData",
                              "directors",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Shareholders">
                        <input
                          type="text"
                          placeholder="Shareholders"
                          value={form.businessData.shareholders}
                          onChange={(event) =>
                            updateNestedField(
                              "businessData",
                              "shareholders",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                      <Field label="Lawyers">
                        <input
                          type="text"
                          placeholder="Lawyers"
                          value={form.businessData.lawyers}
                          onChange={(event) =>
                            updateNestedField(
                              "businessData",
                              "lawyers",
                              event.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </Field>
                    </>
                  )}
                </div>
              </section>

              <section className="space-y-5 border-t border-[#2B2A2A]/10 pt-6 dark:border-[#F5F2F2]/10">
                <h3 className="text-sm font-bold">Contact information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className={inputStyle}
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      type="tel"
                      placeholder="+62 812 0000 0000"
                      value={form.phoneNumber}
                      onChange={(event) =>
                        updateField("phoneNumber", event.target.value)
                      }
                      className={inputStyle}
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-5 border-t border-[#2B2A2A]/10 pt-6 dark:border-[#F5F2F2]/10">
                <h3 className="text-sm font-bold">Address</h3>
                <Field label="Address">
                  <input
                    type="text"
                    placeholder="Street, city, province"
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className={inputStyle}
                  />
                </Field>
              </section>

              <section className="space-y-5 border-t border-[#2B2A2A]/10 pt-6 dark:border-[#F5F2F2]/10">
                <h3 className="text-sm font-bold">Additional information</h3>
                <Field label="Notes">
                  <textarea
                    placeholder="Add notes about this contact"
                    value={form.additionalInfo}
                    onChange={(event) =>
                      updateField("additionalInfo", event.target.value)
                    }
                    className={textareaStyle}
                  />
                </Field>
              </section>
            </div>
          </div>

          <div className="border-t border-[#2B2A2A]/10 px-5 py-5 dark:border-[#F5F2F2]/10 sm:px-8">
            {errorMessage && (
              <p
                role="alert"
                className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300"
              >
                {errorMessage}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className={`h-11 flex-1 rounded-xl border border-[#2B2A2A]/15 text-sm font-semibold text-[#2B2A2A] transition-colors hover:bg-[#2B2A2A]/5 active:bg-[#2B2A2A]/10 dark:border-[#F5F2F2]/15 dark:text-[#F5F2F2] dark:hover:bg-[#F5F2F2]/10 dark:active:bg-[#F5F2F2]/15 ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-[#4A69BC] text-sm font-semibold text-white transition-colors hover:bg-[#3F5CA8] active:bg-[#3A569F] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
              >
                {isSaving && (
                  <Loader2
                    size={16}
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                )}
                {isSaving ? "Saving..." : "Save contact"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
