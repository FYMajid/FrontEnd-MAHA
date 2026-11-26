"use client";

import React from "react";
import {
  AlignLeft,
  Briefcase,
  CalendarIcon,
  Link2,
  MapPin,
  Repeat,
  Upload,
  Users,
  X,
} from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { EventItem } from "@/services/events";

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start) return "-";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  if (Number.isNaN(startDate.getTime())) return "-";

  const day = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
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

const attendeeList = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

interface EventDetailModalProps {
  isOpen: boolean;
  event: EventItem | null;
  matterLabel: string;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const labelClass =
  "flex items-center gap-3 text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70";

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  event,
  matterLabel,
  onClose,
  onDelete,
  onEdit,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    showCloseButton={false}
    className="w-full max-w-[min(56rem,calc(100vw-1rem))] bg-transparent shadow-none"
  >
    {event && (
      <div className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-[#F5F2F2] text-[#2B2A2A] dark:border-white/10 dark:bg-[#2B2A2A] dark:text-[#F5F2F2] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 text-xs font-black uppercase tracking-widest">
            <CalendarIcon size={16} className="shrink-0" />
            <span className="truncate">Detail Event</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail event"
            className="-mr-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2B2A2A] transition-colors hover:bg-black/5 dark:text-[#F5F2F2] dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
              {event.title}
            </h2>
            <p className="mt-1 text-sm text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
              {formatDateRange(event.startTime, event.endTime)}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:mt-6 md:grid-cols-[200px_1fr] md:gap-4">
            <div className={labelClass}>
              <Briefcase size={18} className="shrink-0" /> Matter
            </div>
            <div className="font-semibold">{matterLabel}</div>

            <div className={labelClass}>
              <MapPin size={18} className="shrink-0" /> Location
            </div>
            <div className="font-semibold">{event.location || "-"}</div>

            <div className={labelClass}>
              <AlignLeft size={18} className="shrink-0" /> Description
            </div>
            <div className="font-semibold">{event.description || "-"}</div>

            <div className={labelClass}>
              <Repeat size={18} className="shrink-0" /> Repeat
            </div>
            <div className="font-semibold">{event.repeat || "none"}</div>

            <div className={labelClass}>
              <Upload size={18} className="shrink-0" /> Upload File
            </div>
            <div className="font-semibold">
              {event.fileUrl || "No documents available"}
            </div>

            <div className={labelClass}>
              <Link2 size={18} className="shrink-0" /> Hyperlink
            </div>
            <div className="font-semibold">{event.hyperlink || "-"}</div>

            <div className={labelClass}>
              <Users size={18} className="shrink-0" /> Attendees
            </div>
            <div className="flex flex-wrap gap-2">
              {attendeeList(event.attendees).length === 0 ? (
                <span className="font-semibold">-</span>
              ) : (
                attendeeList(event.attendees).map((attendee) => (
                  <span
                    key={attendee}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold dark:bg-white/10"
                  >
                    {attendee}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-black/10 px-4 py-3 dark:border-white/10 sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onDelete}
            className="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#2B2A2A] transition-colors hover:text-[#FEB05D] dark:text-[#F5F2F2] dark:hover:text-[#FEB05D]"
          >
            Delete Event
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex h-11 items-center rounded-xl bg-[#5A7ACD] px-5 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-[#FEB05D] hover:text-[#2B2A2A]"
          >
            Edit Event
          </button>
        </div>
      </div>
    )}
  </Modal>
);

export default EventDetailModal;
