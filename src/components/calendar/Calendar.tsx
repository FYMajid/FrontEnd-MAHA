"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { eventService, EventCategory, EventItem } from "@/services/events";
import { matterService, MatterItem } from "@/services/matters";
import EventDetailModal from "./EventDetailModal";
import EventFormModal, {
  buildEmptyForm,
  EventFormState,
  toInputValue,
  todayInput,
} from "./EventFormModal";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
  };
}

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

  return (
    <div className="calendar-fit flex h-[calc(100dvh-6rem-1px)] bg-white flex-col overflow-hidden rounded-2xl border border-[#5A7ACD]/20 bg-[#F5F2F2] dark:bg-[#2B2A2A] sm:p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        expandRows
        dayMaxEvents
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

      <EventDetailModal
        isOpen={isDetailOpen}
        event={selectedEvent}
        matterLabel={selectedEvent ? resolveMatterLabel(selectedEvent) : "-"}
        onClose={closeDetail}
        onDelete={handleDelete}
        onEdit={() => {
          if (!selectedEvent) return;
          closeDetail();
          openEditModal(selectedEvent);
        }}
      />

      <EventFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        mode={formMode}
        form={form}
        categories={categories}
        matters={matters}
        error={error}
        isSaving={isSaving}
        onChange={updateForm}
        onSave={handleSave}
      />
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => (
  <div className="text-xs bg-[#5A7ACD] text-white px-2 py-1 rounded">
    {eventInfo.event.title}
  </div>
);

export default Calendar;
