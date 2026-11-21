import api from "./api";

export interface EventCategory {
  id: string;
  name: string;
  color?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  categoryId: string;
  category?: EventCategory | null;
  location?: string | null;
  startTime: string;
  endTime: string;
  description?: string | null;
  matterId?: string | null;
  matter?: { id: string; caseArea?: string | null } | null;
  notification?: string | null;
  attendees?: string | null;
  repeat?: string | null;
  hyperlink?: string | null;
  fileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const eventService = {
  async list() {
    const response = await api.get<EventItem[]>("/events");
    return response.data;
  },

  async listByMonth(month: number, year: number) {
    const response = await api.get<{ data?: EventItem[] } | EventItem[]>("/events/filter", {
      params: { month, year },
    });

    if (Array.isArray(response.data)) return response.data;
    return response.data.data ?? [];
  },

  async getById(id: string) {
    const response = await api.get<{ data?: EventItem } | EventItem>(`/events/${id}`);
    if ("id" in response.data) return response.data;
    if (response.data.data) return response.data.data;
    throw new Error("Invalid event response");
  },

  async create(payload: {
    title: string;
    categoryId: string;
    location?: string;
    startTime: string;
    endTime: string;
    description?: string;
    matterId?: string;
    notification?: string;
    attendees?: string;
    repeat?: string;
    hyperlink?: string;
    fileUrl?: string;
  }) {
    const response = await api.post<{ data?: EventItem } | EventItem>("/events", payload);
    if ("id" in response.data) return response.data;
    if (response.data.data) return response.data.data;
    throw new Error("Invalid event response");
  },

  async update(id: string, payload: Partial<{
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
  }>) {
    const response = await api.put<{ data?: EventItem } | EventItem>(`/events/${id}`, payload);
    if ("id" in response.data) return response.data;
    if (response.data.data) return response.data.data;
    throw new Error("Invalid event response");
  },

  async remove(id: string) {
    await api.delete(`/events/${id}`);
  },

  async listCategories() {
    const response = await api.get<EventCategory[]>("/events/categories");
    return response.data;
  },
};
