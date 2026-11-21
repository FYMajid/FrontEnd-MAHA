import api from "./api";

export type MatterStatus = "DONE" | "IN_PROGRESS" | "PENDING";

export interface MatterItem {
  id: string;
  clientId: string;
  client?: { name?: string | null } | null;
  responsibleAttorneyId: string;
  responsibleAttorney?: { firstName?: string | null; lastName?: string | null } | null;
  members?: string | null;
  caseArea: string;
  caseType: string;
  disputeResolution: string;
  description?: string | null;
  address?: string | null;
  status: MatterStatus;
  startDate?: string | null;
  pendingDate?: string | null;
  closeDate?: string | null;
  paymentMethod?: string | null;
  additionalInfo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type MatterListResponse =
  | MatterItem[]
  | { status?: string; data?: MatterItem[] };

type MatterDetailResponse =
  | MatterItem
  | { status?: string; data?: MatterItem };

const normalizeList = (payload: MatterListResponse): MatterItem[] => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
};

const normalizeDetail = (payload: MatterDetailResponse): MatterItem => {
  if ("id" in payload) return payload;
  if (payload.data) return payload.data;
  throw new Error("Invalid matter response");
};

export const matterService = {
  async list() {
    const response = await api.get<MatterListResponse>("/metter");
    return normalizeList(response.data);
  },

  async getById(id: string) {
    const response = await api.get<MatterDetailResponse>(`/metter/${id}`);
    return normalizeDetail(response.data);
  },

  async create(payload: {
    clientId: string;
    responsibleAttorneyId: string;
    members?: string;
    caseArea: string;
    caseType: string;
    disputeResolution: string;
    description?: string;
    address?: string;
    status: MatterStatus;
    startDate?: string;
    pendingDate?: string;
    closeDate?: string;
    paymentMethod?: string;
    additionalInfo?: string;
  }) {
    const response = await api.post<MatterDetailResponse>("/metter", payload);
    return normalizeDetail(response.data);
  },

  async update(id: string, payload: Partial<Omit<MatterItem, "id">>) {
    const response = await api.put<MatterDetailResponse>(`/metter/${id}`, payload);
    return normalizeDetail(response.data);
  },

  async remove(id: string) {
    await api.delete(`/metter/${id}`);
  },
};
