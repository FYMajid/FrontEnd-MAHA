"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import {
  AlignLeft,
  Briefcase,
  CalendarIcon,
  ChevronDown,
  Link2,
  MapPin,
  Repeat,
  Upload,
  Users,
  X,
} from "lucide-react";
import { eventService, EventCategory, EventItem } from "@/services/events";
import { matterService, MatterItem } from "@/services/matters";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
  };
}

interface EventFormState {
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

const todayInput = toLocalInputValue(new Date());

const mapEventToCalendar = (event: EventItem): CalendarEvent => ({
  id: event.id,
  title: event.title,
  start: event.startTime,
  end: event.endTime,
  extendedProps: {
    calendar: event.category?.name ?? "Primary",
    description: event.description ?? undefined,
  },
});

const toInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toLocalInputValue(date);
};

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

const buildEmptyForm = (categoryId: string, start?: string, end?: string) => ({
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

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventFormState | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } =
    useModal();
  const {
    isOpen: isDetailOpen,
    openModal: openDetail,
    closeModal: closeDetail,
  } = useModal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isActive = true;

    Promise.all([eventService.list(), eventService.listCategories(), matterService.list()])
      .then(([eventData, categoryData, matterData]) => {
        if (!isActive) return;
        setEvents(eventData);
        setCategories(categoryData);
        setMatters(matterData);
      })
      .catch(() => {
        if (!isActive) return;
        setEvents([
          {
            id: "local-1",
            title: "Sidang Perdata",
            categoryId: "",
            startTime: todayInput,
            endTime: todayInput,
            description: "",
          },
        ]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const calendarEvents = useMemo(
    () => events.map(mapEventToCalendar),
    [events],
  );

  const resolveMatterLabel = (event: EventItem) => {
    if (!event.matterId) return "-";
    const matter = matters.find((item) => item.id === event.matterId);
    if (!matter) return event.matter?.caseArea ?? event.matterId;
    const client = matter.client?.name ?? "Client";
    return `${client} : ${matter.caseArea} ${matter.caseType}`;
  };

  const attendeeList = (value?: string | null) => {
    if (!value) return [];
    return value
      .split(/[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const openCreateModal = (start?: string, end?: string) => {
    const defaultCategory = categories[0]?.id ?? "";
    setFormMode("create");
    setForm(buildEmptyForm(defaultCategory, start, end));
    setError(null);
    openForm();
  };

  const openEditModal = (event: EventItem) => {
    setFormMode("edit");
    setForm({
      id: event.id,
      title: event.title,
      categoryId: event.categoryId ?? categories[0]?.id ?? "",
      location: event.location ?? "",
      startTime: toInputValue(event.startTime),
      endTime: toInputValue(event.endTime),
      description: event.description ?? "",
      matterId: event.matterId ?? "",
      notification: event.notification ?? "",
      attendees: event.attendees ?? "",
      repeat: event.repeat ?? "none",
      hyperlink: event.hyperlink ?? "",
      fileUrl: event.fileUrl ?? "",
    });
    setError(null);
    openForm();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    openCreateModal(selectInfo.startStr, selectInfo.endStr);
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const eventId = String(clickInfo.event.id);
    try {
      const detail = await eventService.getById(eventId);
      setSelectedEvent(detail);
      openDetail();
    } catch {
      const fallback = events.find((item) => item.id === eventId) || null;
      setSelectedEvent(fallback);
      openDetail();
    }
  };

  const updateForm = (field: keyof EventFormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;

    if (!form.title.trim()) {
      setError("Title wajib diisi.");
      return;
    }
    if (!form.categoryId) {
      setError("Category wajib dipilih.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (formMode === "create") {
        const created = await eventService.create({
          title: form.title,
          categoryId: form.categoryId,
          location: form.location || undefined,
          startTime: form.startTime || todayInput,
          endTime: form.endTime || form.startTime || todayInput,
          description: form.description || undefined,
          matterId: form.matterId || undefined,
          notification: form.notification || undefined,
          attendees: form.attendees || undefined,
          repeat: form.repeat || undefined,
          hyperlink: form.hyperlink || undefined,
          fileUrl: form.fileUrl || undefined,
        });
        setEvents((prev) => [created, ...prev]);
      } else if (form.id) {
        const updated = await eventService.update(form.id, {
          title: form.title,
          categoryId: form.categoryId,
          location: form.location || undefined,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          description: form.description || undefined,
          matterId: form.matterId || undefined,
          notification: form.notification || undefined,
          attendees: form.attendees || undefined,
          repeat: form.repeat || undefined,
          hyperlink: form.hyperlink || undefined,
          fileUrl: form.fileUrl || undefined,
        });
        setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }

      closeForm();
    } catch {
      setError("Gagal menyimpan event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await eventService.remove(selectedEvent.id);
      setEvents((prev) => prev.filter((item) => item.id !== selectedEvent.id));
      closeDetail();
    } catch {
      setError("Gagal menghapus event.");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  return (
    <div className="rounded-2xl border border-[#5A7ACD]/20 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-5">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        selectable
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        headerToolbar={{
          left: "prev,next addEventButton",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        customButtons={{
          addEventButton: {
            text: "Add Event +",
            click: () => openCreateModal(),
          },
        }}
      />

      {/* ======================
         DETAIL MODAL
      ====================== */}
      <Modal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        showCloseButton={false}
        className="bg-transparent shadow-none max-w-4xl w-[92vw]"
      >
        {selectedEvent && (
          <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] rounded-3xl border border-white/10">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2] font-black uppercase tracking-widest text-xs">
                <CalendarIcon size={16} /> Detail Event
              </div>
              <button
                onClick={closeDetail}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-1 rounded-full bg-[#F5F2F2] dark:bg-[#2B2A2A]" />
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-sm text-[#2B2A2A] dark:text-[#F5F2F2] mt-1">
                    {formatDateRange(selectedEvent.startTime, selectedEvent.endTime)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 text-sm">
                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <Briefcase size={18} /> Matter
                </div>
                <div className="font-semibold">
                  {resolveMatterLabel(selectedEvent)}
                </div>

                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <MapPin size={18} /> Location
                </div>
                <div className="font-semibold">
                  {selectedEvent.location || "-"}
                </div>

                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <AlignLeft size={18} /> Description
                </div>
                <div className="font-semibold">
                  {selectedEvent.description || "-"}
                </div>

                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <Repeat size={18} /> Repeat
                </div>
                <div className="font-semibold">
                  {selectedEvent.repeat || "none"}
                </div>

                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <Upload size={18} /> Upload File
                </div>
                <div className="font-semibold">
                  {selectedEvent.fileUrl || "No documents available"}
                </div>

                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <Link2 size={18} /> Hyperlink
                </div>
                <div className="font-semibold">
                  {selectedEvent.hyperlink || "-"}
                </div>

                <div className="flex items-center gap-3 text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <Users size={18} /> Attendees
                </div>
                <div className="flex flex-wrap gap-2">
                  {attendeeList(selectedEvent.attendees).length === 0 ? (
                    <span className="font-semibold">-</span>
                  ) : (
                    attendeeList(selectedEvent.attendees).map((attendee) => (
                      <span
                        key={attendee}
                        className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold"
                      >
                        {attendee}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 px-8 py-6 border-t border-white/10">
              <button
                onClick={handleDelete}
                className="text-[#2B2A2A] dark:text-[#F5F2F2] hover:text-[#FEB05D] dark:hover:text-[#FEB05D] text-sm font-semibold"
              >
                Delete Event
              </button>
              <button
                onClick={() => {
                  closeDetail();
                  openEditModal(selectedEvent);
                }}
                className="px-6 py-3 rounded-xl bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] text-sm font-black uppercase tracking-widest transition-all"
              >
                Edit Event
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================
         FORM MODAL
      ====================== */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        showCloseButton={false}
        className="bg-transparent shadow-none max-w-4xl w-[92vw]"
      >
        {form && (
          <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] rounded-3xl border border-white/10">
            <div className="flex items-center justify-between px-8 py-6 border-b border-black dark:border-white">
              <div className="flex items-center gap-3 text-[#5A7ACD] font-black uppercase tracking-widest text-xs">
                <CalendarIcon size={16} />
                {formMode === "create" ? "Create Event" : "Edit Event"}
              </div>
              <button
                onClick={closeForm}
                className="text-[#2B2A2A] dark:text-[#F5F2F2] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-8 space-y-6">
              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                    placeholder="Event title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={form.categoryId}
                      onChange={(e) => updateForm("categoryId", e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#5A7ACD]"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                    />
                  </div>
                  {categories.length === 0 && (
                    <p className="text-xs text-[#2B2A2A] dark:text-[#F5F2F2]">
                      Tambahkan event category di backend.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => updateForm("startTime", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => updateForm("endTime", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Matter
                  </label>
                  <div className="relative">
                    <select
                      value={form.matterId}
                      onChange={(e) => updateForm("matterId", e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#5A7ACD]"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                    placeholder="Location"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Repeat
                  </label>
                  <div className="relative">
                    <select
                      value={form.repeat}
                      onChange={(e) => updateForm("repeat", e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[#5A7ACD]"
                    >
                      {[
                        "none",
                        "daily",
                        "weekly",
                        "monthly",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Notification
                  </label>
                  <input
                    value={form.notification}
                    onChange={(e) => updateForm("notification", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                    placeholder="15 minutes before"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Attendees
                  </label>
                  <input
                    value={form.attendees}
                    onChange={(e) => updateForm("attendees", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                    placeholder="Aufa Hajran, Team"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Hyperlink
                  </label>
                  <input
                    value={form.hyperlink}
                    onChange={(e) => updateForm("hyperlink", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border bg-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    File URL
                  </label>
                  <input
                    value={form.fileUrl}
                    onChange={(e) => updateForm("fileUrl", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD]"
                    placeholder="/uploads/file.pdf"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2B2A2A] dark:text-[#F5F2F2] font-black">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A7ACD] min-h-[120px]"
                    placeholder="Description"
                  />
                </div>

                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl px-4 py-6 text-sm text-[#2B2A2A] dark:text-[#F5F2F2] flex items-center gap-3 cursor-pointer hover:border-[#5A7ACD] transition-all md:col-span-2"
                >
                  <Upload size={18} className="text-[#5A7ACD]" />
                  Upload file (optional)
                  <input ref={fileInputRef} type="file" className="hidden" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 px-8 py-6 border-t border-white/10">
              <button
                onClick={closeForm}
                className="text-[#2B2A2A] dark:text-[#F5F2F2] hover:text-[#FEB05D] dark:hover:text-[#FEB05D] text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] text-sm font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : formMode === "create" ? "Create Event" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ======================
   EVENT RENDER
====================== */

const renderEventContent = (eventInfo: EventContentArg) => (
  <div className="text-xs bg-[#5A7ACD] text-white px-2 py-1 rounded">
    {eventInfo.event.title}
  </div>
);

export default Calendar;
