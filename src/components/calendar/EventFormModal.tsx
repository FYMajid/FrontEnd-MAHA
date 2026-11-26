"use client";

import React, { useRef } from "react";
import { CalendarIcon, ChevronDown, Upload, X } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { EventCategory } from "@/services/events";
import { MatterItem } from "@/services/matters";

export interface EventFormState {
  id?: string;
  title: string;
  categoryId: string;
  location: string;
  startTime: string;
  endTime: string;
  description: string;
  matterId: string;
  notification: string;
  attendees: string;
  repeat: string;
  hyperlink: string;
  fileUrl: string;
}

const toLocalInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export const todayInput = toLocalInputValue(new Date());

export const toInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toLocalInputValue(date);
};

export const buildEmptyForm = (categoryId: string, start?: string, end?: string): EventFormState => ({
  title: "",
  categoryId,
  location: "",
  startTime: start ?? todayInput,
  endTime: end ?? "",
  description: "",
  matterId: "",
  notification: "",
  attendees: "",
  repeat: "none",
  hyperlink: "",
  fileUrl: "",
});

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  form: EventFormState | null;
  categories: EventCategory[];
  matters: MatterItem[];
  error: string | null;
  isSaving: boolean;
  onChange: (field: keyof EventFormState, value: string) => void;
  onSave: () => void;
}

const labelClass =
  "text-[10px] font-black uppercase tracking-[0.15em] text-[#2B2A2A] dark:text-[#F5F2F2] sm:tracking-[0.2em]";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-black/5 px-3.5 py-2.5 text-base outline-none transition focus:border-[#5A7ACD] dark:border-white/10 dark:bg-white/5 sm:text-sm";

const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  form,
  categories,
  matters,
  error,
  isSaving,
  onChange,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="w-full max-w-[min(48rem,calc(100vw-1rem))] bg-transparent shadow-none"
    >
      {form && (
        <div className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-[#F5F2F2] text-[#2B2A2A] dark:border-white/10 dark:bg-[#2B2A2A] dark:text-[#F5F2F2] sm:max-h-[calc(100dvh-3rem)]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5 text-xs font-black uppercase tracking-widest text-[#5A7ACD]">
              <CalendarIcon size={16} className="shrink-0" />
              <span className="truncate">
                {mode === "create" ? "Create Event" : "Edit Event"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup form event"
              className="-mr-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2B2A2A] transition-colors hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <p
              aria-live="polite"
              className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-500 sm:px-6"
            >
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => onChange("title", e.target.value)}
                  className={inputClass}
                  placeholder="Event title"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Category</label>
                <div className="relative">
                  <select
                    value={form.categoryId}
                    onChange={(e) => onChange("categoryId", e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                  />
                </div>
                {categories.length === 0 && (
                  <p className="text-xs text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
                    Tambahkan event category di backend.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Start</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => onChange("startTime", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>End</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => onChange("endTime", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClass}>Matter</label>
                <div className="relative">
                  <select
                    value={form.matterId}
                    onChange={(e) => onChange("matterId", e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select matter</option>
                    {matters.map((matter) => (
                      <option key={matter.id} value={matter.id}>
                        {matter.client?.name ?? "Client"} - {matter.caseArea} {matter.caseType}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => onChange("location", e.target.value)}
                  className={inputClass}
                  placeholder="Location"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Repeat</label>
                <div className="relative">
                  <select
                    value={form.repeat}
                    onChange={(e) => onChange("repeat", e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {["none", "daily", "weekly", "monthly"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Notification</label>
                <input
                  value={form.notification}
                  onChange={(e) => onChange("notification", e.target.value)}
                  className={inputClass}
                  placeholder="15 minutes before"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Attendees</label>
                <input
                  value={form.attendees}
                  onChange={(e) => onChange("attendees", e.target.value)}
                  className={inputClass}
                  placeholder="Aufa Hajran, Team"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Hyperlink</label>
                <input
                  value={form.hyperlink}
                  onChange={(e) => onChange("hyperlink", e.target.value)}
                  className={inputClass}
                  placeholder="https://"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>File URL</label>
                <input
                  value={form.fileUrl}
                  onChange={(e) => onChange("fileUrl", e.target.value)}
                  className={inputClass}
                  placeholder="/uploads/file.pdf"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  className={`${inputClass} min-h-[96px] resize-y sm:min-h-[120px]`}
                  placeholder="Description"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-black/10 px-4 py-3 text-left text-sm text-[#2B2A2A] transition hover:border-[#5A7ACD] dark:border-white/10 dark:text-[#F5F2F2]"
                >
                  <Upload size={18} className="shrink-0 text-[#5A7ACD]" />
                  Upload file (optional)
                </button>
                <input ref={fileInputRef} type="file" className="hidden" />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-black/10 px-4 py-3 dark:border-white/10 sm:gap-4 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#2B2A2A] transition-colors hover:text-[#FEB05D] dark:text-[#F5F2F2] dark:hover:text-[#FEB05D]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex h-11 items-center rounded-xl bg-[#5A7ACD] px-5 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-[#FEB05D] hover:text-[#2B2A2A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : mode === "create" ? "Create Event" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EventFormModal;
