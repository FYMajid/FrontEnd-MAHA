"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { CalendarIcon, Upload, XCircle } from "lucide-react";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Fungsi untuk memicu jendela pilih file
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Fungsi untuk menangani file yang terpilih
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File terpilih:", file.name);
      // Lakukan logika upload Anda di sini
    }
  };

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    // Initialize with some events
    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: openModal,
            },
          }}
        />
      </div>
      <Modal
  isOpen={isOpen}
  onClose={closeModal}
  className="max-w-[700px] p-0 overflow-hidden" // P-0 agar header tetap diam saat konten di-scroll
>
  <div className="flex flex-col h-[85vh] max-h-[800px]">
    {/* Header Modal - Tetap di Atas */}
    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
          <CalendarIcon size={20} />
        </div>
        <h5 className="font-bold text-gray-800 dark:text-white/90 text-xl lg:text-2xl">
          {selectedEvent ? "Edit Event" : "Add Event"}
        </h5>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Isi detail informasi di bawah ini untuk membuat agenda baru.
      </p>
    </div>

    {/* Konten Modal - Area Scrollable */}
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 bg-white dark:bg-[#121212]">
      
      {/* SECTION 1: DETAIL EVENT */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Event</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Event Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-white">Event Name</label>
            <input
              type="text"
              placeholder="Masukkan nama agenda..."
              className="w-full rounded-xl border border-teal-500/30 dark:text-white bg-transparent px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-white">Event Category</label>
              <select className="w-full rounded-xl border border-gray-300 dark:text-white bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option>Pilih Kategori</option>
                <option>Sidang</option>
                <option>Meeting Klien</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-white">Location</label>
              <input type="text" placeholder="Lokasi..." className="w-full dark:text-white rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <div className="space-y-1.5">
              <label className="text-sm font-medium dark:text-white text-gray-700">Start Time</label>
              <input type="datetime-local" className="w-full dark:text-white rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-white">End Time</label>
              <input type="datetime-local" className="w-full rounded-xl dark:text-white border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-white">Description</label>
            <textarea rows={3} placeholder="Deskripsi agenda..." className="w-full rounded-xl dark:text-white border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
        </div>
      </section>

      {/* SECTION 2: EVENT RELATION */}
      <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Event Relation</h3>
        <div className="space-y-4">
          <select className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm dark:text-white dark:border-gray-700 dark:bg-gray-900"><option>Matter</option></select>
          <div className="flex gap-2">
            <select className="flex-1 rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700  dark:text-white  dark:bg-gray-900"><option>Aufa Hajran</option></select>
            <button className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
              <XCircle size={20} />
            </button>
          </div>
          <select className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm dark:text-white dark:border-gray-700 dark:bg-gray-900"><option>Notification</option></select>
          <input type="text" placeholder="Attendees" className="w-full rounded-xl border dark:text-white border-gray-300 bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <select className="w-full rounded-xl border border-gray-300 dark:text-white bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Repeat</option></select>
          <input type="url" placeholder="Hyperlink" className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm dark:text-white dark:border-gray-700 dark:bg-gray-900" />
        </div>
      </section>

      {/* SECTION 3: UPLOAD FILE */}
     <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold text-teal-500 dark:text-teal-400">Upload File</h3>
      
      {/* 4. Tambahkan onClick pada div container */}
      <div 
        onClick={handleUploadClick}
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-teal-500 transition-colors cursor-pointer group"
      >
        {/* 5. Input file yang disembunyikan */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*" // Membatasi hanya untuk file gambar
          className="hidden" 
        />

        <Upload className="text-gray-400 group-hover:text-teal-500 transition-colors" size={32} />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select or drag and drop your files here
          </p>
          <p className="text-xs text-gray-400 mt-1">(Up to 5MB)</p>
        </div>
      </div>
    </section>
    </div>

    {/* Footer Modal - Tetap di Bawah */}
    <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-[#121212]">
      <button
        onClick={closeModal}
        className="flex-1 justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:flex-none sm:w-32"
      >
        Close
      </button>
      <button
        onClick={handleAddOrUpdateEvent}
        className="flex-1 justify-center rounded-xl bg-teal-500 px-4 py-3 text-sm font-black text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20 sm:flex-none sm:w-48"
      >
        {selectedEvent ? "Update Changes" : "Save Agenda"}
      </button>
    </div>
  </div>
</Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
