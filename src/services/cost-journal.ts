import api from "./api";

export type CostJournalEntryType = "EXPENSE" | "TIME";
export type CostJournalBillingType = "BILLABLE" | "NON_BILLABLE";

export interface CostJournalMatterSummary {
  id: string;
  caseArea?: string | null;
  caseType?: string | null;
  client?: {
    id: string;
    name?: string | null;
  } | null;
}

export interface CostJournalItem {
  id: string;
  matterId: string;
  matter?: CostJournalMatterSummary | null;
  entryType: CostJournalEntryType;
  billingType: CostJournalBillingType;
  category?: string | null;
  entryDate: string;
  description?: string | null;
  quantity?: number | null;
  unitCost?: number | null;
  durationMinutes?: number | null;
  hourlyRate?: number | null;
  totalCost: number;
  attachmentUrl?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

type CostJournalListResponse =
  | CostJournalItem[]
  | { status?: string; data?: CostJournalItem[] };

type CostJournalDetailResponse =
  | CostJournalItem
  | { status?: string; data?: CostJournalItem };

const normalizeList = (payload: CostJournalListResponse): CostJournalItem[] => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
};

const normalizeDetail = (payload: CostJournalDetailResponse): CostJournalItem => {
  if ("id" in payload) return payload;
  if (payload.data) return payload.data;
  throw new Error("Invalid cost journal response");
};

export const costJournalService = {
  async list(params?: {
    search?: string;
    type?: CostJournalEntryType;
    billingType?: CostJournalBillingType;
    matterId?: string;
  }) {
    const response = await api.get<CostJournalListResponse>("/cost-journal", {
      params,
    });
    return normalizeList(response.data);
  },

  async getById(id: string) {
    const response = await api.get<CostJournalDetailResponse>(
      `/cost-journal/${id}`,
    );
    return normalizeDetail(response.data);
  },

  async create(payload: {
    matterId: string;
    entryType: CostJournalEntryType;
    billingType?: CostJournalBillingType;
    category?: string;
    entryDate: string;
    description?: string;
    quantity?: number;
    unitCost?: number;
    durationMinutes?: number;
    hourlyRate?: number;
    attachmentUrl?: string;
    createdBy?: string;
  }) {
    const response = await api.post<CostJournalDetailResponse>(
      "/cost-journal",
      payload,
    );
    return normalizeDetail(response.data);
  },

  async update(
    id: string,
    payload: Partial<{
      matterId: string;
      entryType: CostJournalEntryType;
      billingType: CostJournalBillingType;
      category: string;
      entryDate: string;
      description: string;
      quantity: number;
      unitCost: number;
      durationMinutes: number;
      hourlyRate: number;
      attachmentUrl: string;
      createdBy: string;
    }>,
  ) {
    const response = await api.put<CostJournalDetailResponse>(
      `/cost-journal/${id}`,
      payload,
    );
    return normalizeDetail(response.data);
  },

  async remove(id: string) {
    await api.delete(`/cost-journal/${id}`);
  },
};
